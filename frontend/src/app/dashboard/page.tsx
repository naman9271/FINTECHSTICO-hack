"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { ModernDataTable } from '@/components/ModernDataTable';
import { ModernChart } from '@/components/ModernChart';
import { AIQueryInterface } from '@/components/AIQueryInterface';
import { 
  Package, 
  DollarSign, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  Zap
} from 'lucide-react';

interface DeadStockItem {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  originalCost: number;
  daysSinceLastSale: number;
  potentialLoss: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface FinancialSummary {
  totalInventoryValue: number;
  deadStockValue: number;
  deadStockPercentage: number;
  itemsAtRisk: number;
}

interface ChartData {
  category: string;
  value: number;
  percentage: number;
}

interface QueryResult {
  answer: string;
  query: string;
}

export default function Dashboard() {
  const [deadStockData, setDeadStockData] = useState<DeadStockItem[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalInventoryValue: 0,
    deadStockValue: 0,
    deadStockPercentage: 0,
    itemsAtRisk: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dead stock data
      const deadStockResponse = await fetch('http://localhost:3001/api/deadstock');
      if (!deadStockResponse.ok) {
        throw new Error(`HTTP error! status: ${deadStockResponse.status}`);
      }
      
      const deadStockResult: ApiResponse<DeadStockItem[]> = await deadStockResponse.json();
      
      if (deadStockResult.success && deadStockResult.data) {
        setDeadStockData(deadStockResult.data);
        
        // Calculate financial summary
        const totalValue = deadStockResult.data.reduce((sum, item) => sum + item.originalCost, 0);
        const deadStockValue = deadStockResult.data.reduce((sum, item) => sum + item.potentialLoss, 0);
        const itemsAtRisk = deadStockResult.data.filter(item => 
          item.riskLevel === 'High' || item.riskLevel === 'Critical'
        ).length;
        
        setFinancialData({
          totalInventoryValue: totalValue * 5, // Approximate total inventory
          deadStockValue,
          deadStockPercentage: totalValue > 0 ? (deadStockValue / totalValue) * 100 : 0,
          itemsAtRisk
        });

        // Generate chart data
        const categoryMap = new Map<string, number>();
        deadStockResult.data.forEach(item => {
          const current = categoryMap.get(item.category) || 0;
          categoryMap.set(item.category, current + item.potentialLoss);
        });

        const chartDataArray: ChartData[] = Array.from(categoryMap.entries()).map(([category, value]) => ({
          category,
          value,
          percentage: totalValue > 0 ? (value / deadStockValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        setChartData(chartDataArray);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async (query: string): Promise<QueryResult> => {
    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<QueryResult> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to process query');
      }
    } catch (error) {
      console.error('Error processing AI query:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-4 text-lg font-semibold text-red-400">Error Loading Dashboard</h2>
            <p className="mt-2 text-sm text-red-300">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white lg:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              AI-powered insights into your dead stock inventory
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Inventory Value"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(financialData.totalInventoryValue)}
            trend="neutral"
            icon={<Package className="h-6 w-6" />}
            description="Current total inventory worth"
          />
          
          <StatsCard
            title="Dead Stock Value"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(financialData.deadStockValue)}
            change={-12.5}
            trend="down"
            icon={<DollarSign className="h-6 w-6" />}
            description="Potential loss from stagnant inventory"
          />
          
          <StatsCard
            title="Dead Stock Percentage"
            value={`${financialData.deadStockPercentage.toFixed(1)}%`}
            change={-2.1}
            trend="down"
            icon={<TrendingDown className="h-6 w-6" />}
            description="Percentage of inventory at risk"
          />
          
          <StatsCard
            title="High Risk Items"
            value={financialData.itemsAtRisk}
            change={5}
            trend="up"
            icon={<AlertTriangle className="h-6 w-6" />}
            description="Items requiring immediate attention"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Table and Chart */}
          <div className="space-y-8 lg:col-span-2">
            <ModernDataTable data={deadStockData} loading={loading} />
            <ModernChart 
              data={chartData} 
              title="Dead Stock by Category"
              totalValue={financialData.deadStockValue}
              loading={loading}
            />
          </div>

          {/* Right Column - AI Interface */}
          <div className="lg:col-span-1">
            <AIQueryInterface onQuery={handleAIQuery} />
          </div>
        </div>
      </main>
    </div>
  );
}
