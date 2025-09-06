"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
  Clock,
  Users,
  Mail,
  Settings,
  Filter
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ReportData {
  summary: {
    totalProducts: number;
    deadStockValue: number;
    categoriesAffected: number;
    averageDaysStagnant: number;
  };
  trends: Array<{
    month: string;
    deadStockValue: number;
    newDeadStock: number;
    resolvedItems: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    items: number;
    value: number;
    percentage: number;
  }>;
  topDeadStockItems: Array<{
    name: string;
    category: string;
    value: number;
    daysSinceLastSale: number;
  }>;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - in real app, this would come from API
      const mockData: ReportData = {
        summary: {
          totalProducts: 152,
          deadStockValue: 142000,
          categoriesAffected: 8,
          averageDaysStagnant: 125
        },
        trends: [
          { month: 'Jan 2025', deadStockValue: 125000, newDeadStock: 15, resolvedItems: 8 },
          { month: 'Feb 2025', deadStockValue: 118000, newDeadStock: 12, resolvedItems: 19 },
          { month: 'Mar 2025', deadStockValue: 132000, newDeadStock: 18, resolvedItems: 6 },
          { month: 'Apr 2025', deadStockValue: 145000, newDeadStock: 22, resolvedItems: 9 },
          { month: 'May 2025', deadStockValue: 138000, newDeadStock: 19, resolvedItems: 16 },
          { month: 'Jun 2025', deadStockValue: 142000, newDeadStock: 21, resolvedItems: 12 }
        ],
        categoryBreakdown: [
          { category: 'Electronics', items: 25, value: 45000, percentage: 31.7 },
          { category: 'Clothing', items: 42, value: 32000, percentage: 22.5 },
          { category: 'Home & Garden', items: 18, value: 28000, percentage: 19.7 },
          { category: 'Sports', items: 15, value: 22000, percentage: 15.5 },
          { category: 'Books', items: 35, value: 15000, percentage: 10.6 }
        ],
        topDeadStockItems: [
          { name: 'iPhone 12 Pro Max', category: 'Electronics', value: 8500, daysSinceLastSale: 180 },
          { name: 'Gaming Laptop', category: 'Electronics', value: 7200, daysSinceLastSale: 145 },
          { name: 'Winter Jacket Collection', category: 'Clothing', value: 6800, daysSinceLastSale: 220 },
          { name: 'Exercise Bike', category: 'Sports', value: 5400, daysSinceLastSale: 165 },
          { name: 'Outdoor Furniture Set', category: 'Home & Garden', value: 4900, daysSinceLastSale: 195 }
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      // In a real app, this would trigger a download
      alert(`${format.toUpperCase()} report generated successfully!`);
    }, 2000);
  };

  const handleScheduleReport = () => {
    alert('Report scheduling feature coming soon!');
  };

  if (loading || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-b-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Generate comprehensive reports and export your inventory insights
            </p>
          </div>
        </div>

        {/* Report Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            
            <Button variant="outline" className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExportReport('pdf')}
              disabled={generatingReport}
              className="bg-red-600 hover:bg-red-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={() => handleExportReport('excel')}
              disabled={generatingReport}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button
              onClick={() => handleExportReport('csv')}
              disabled={generatingReport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleScheduleReport}
              variant="outline"
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Mail className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Dead Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.deadStockValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories Affected</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.categoriesAffected}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Days Stagnant</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.averageDaysStagnant}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Trends</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Categories</TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Top Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dead Stock Distribution</h3>
                  <div className="space-y-4">
                    {reportData.categoryBreakdown.map((category, index) => {
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
                      return (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm text-gray-700">{category.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatCurrency(category.value)}</p>
                            <p className="text-xs text-gray-500">{category.items} items</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Action Required</span>
                      </div>
                      <p className="mt-1 text-xs text-orange-700">
                        Electronics category shows highest dead stock value at {formatCurrency(45000)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Trend Analysis</span>
                      </div>
                      <p className="mt-1 text-xs text-blue-700">
                        Dead stock increased by 12% this quarter compared to last
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Opportunity</span>
                      </div>
                      <p className="mt-1 text-xs text-green-700">
                        Clothing category has fastest resolution rate at 16 items/month
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Dead Stock Trends Over Time</h3>
                <div className="space-y-4">
                  {reportData.trends.map((trend, index) => (
                    <div key={trend.month} className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{trend.month}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dead Stock Value</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(trend.deadStockValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">New Dead Stock</p>
                        <p className="text-sm font-medium text-red-600">+{trend.newDeadStock} items</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Resolved</p>
                        <p className="text-sm font-medium text-green-600">-{trend.resolvedItems} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
                <div className="space-y-4">
                  {reportData.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                          {category.percentage.toFixed(1)}% of total
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="text-lg font-semibold text-gray-900">{category.items}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Value</p>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(category.value)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Dead Stock Items</h3>
                <div className="space-y-4">
                  {reportData.topDeadStockItems.map((item, index) => (
                    <div key={item.name} className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                          <p className="text-xs text-orange-600">
                            {item.daysSinceLastSale} days since last sale
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
