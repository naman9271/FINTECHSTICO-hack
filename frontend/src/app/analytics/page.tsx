"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AnalyticsData {
  monthlyTrends: Array<{
    month: string;
    deadStockValue: number;
    inventoryTurnover: number;
    newDeadStock: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    count: number;
    percentage: number;
  }>;
  riskAnalysis: {
    criticalItems: number;
    highRiskItems: number;
    mediumRiskItems: number;
    lowRiskItems: number;
  };
  predictions: {
    nextMonthDeadStock: number;
    trendDirection: 'up' | 'down' | 'stable';
    confidenceLevel: number;
  };
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data for now - in real app, this would come from API
      const mockData: AnalyticsData = {
        monthlyTrends: [
          { month: 'Jan 2025', deadStockValue: 125000, inventoryTurnover: 2.3, newDeadStock: 15 },
          { month: 'Feb 2025', deadStockValue: 118000, inventoryTurnover: 2.5, newDeadStock: 12 },
          { month: 'Mar 2025', deadStockValue: 132000, inventoryTurnover: 2.1, newDeadStock: 18 },
          { month: 'Apr 2025', deadStockValue: 145000, inventoryTurnover: 1.9, newDeadStock: 22 },
          { month: 'May 2025', deadStockValue: 138000, inventoryTurnover: 2.2, newDeadStock: 19 },
          { month: 'Jun 2025', deadStockValue: 142000, inventoryTurnover: 2.0, newDeadStock: 21 }
        ],
        categoryBreakdown: [
          { category: 'Electronics', value: 45000, count: 25, percentage: 31.7 },
          { category: 'Clothing', value: 32000, count: 42, percentage: 22.5 },
          { category: 'Home & Garden', value: 28000, count: 18, percentage: 19.7 },
          { category: 'Sports', value: 22000, count: 15, percentage: 15.5 },
          { category: 'Books', value: 15000, count: 35, percentage: 10.6 }
        ],
        riskAnalysis: {
          criticalItems: 12,
          highRiskItems: 28,
          mediumRiskItems: 45,
          lowRiskItems: 67
        },
        predictions: {
          nextMonthDeadStock: 148000,
          trendDirection: 'up',
          confidenceLevel: 85
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const getBarWidth = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-b-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const maxCategoryValue = Math.max(...analyticsData.categoryBreakdown.map(c => c.value));
  const totalRiskItems = analyticsData.riskAnalysis.criticalItems + 
                         analyticsData.riskAnalysis.highRiskItems + 
                         analyticsData.riskAnalysis.mediumRiskItems + 
                         analyticsData.riskAnalysis.lowRiskItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
              Analytics & Insights
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Deep dive into your inventory performance and trends
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Current Dead Stock"
            value={formatCurrency(analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 1].deadStockValue)}
            change={-4.2}
            trend="down"
            icon={<Package className="h-6 w-6" />}
            description="Vs last month"
          />
          
          <StatsCard
            title="Inventory Turnover"
            value={`${analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 1].inventoryTurnover}x`}
            change={8.1}
            trend="up"
            icon={<Activity className="h-6 w-6" />}
            description="Annual turnover ratio"
          />
          
          <StatsCard
            title="Risk Items"
            value={analyticsData.riskAnalysis.criticalItems + analyticsData.riskAnalysis.highRiskItems}
            change={12}
            trend="up"
            icon={<AlertTriangle className="h-6 w-6" />}
            description="Critical + High risk"
          />
          
          <StatsCard
            title="Prediction Confidence"
            value={`${analyticsData.predictions.confidenceLevel}%`}
            trend="neutral"
            icon={<Target className="h-6 w-6" />}
            description="AI model accuracy"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="border-gray-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Dead Stock Trends</h3>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    6 Months
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {analyticsData.monthlyTrends.map((trend, index) => (
                    <div key={trend.month} className="group">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">Turnover: {trend.inventoryTurnover}x</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(trend.deadStockValue)}</span>
                        </div>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${getBarWidth(trend.deadStockValue, 160000)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {trend.newDeadStock} new dead stock items
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Category Breakdown</h3>
                  <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-400">
                    <PieChart className="mr-1 h-3 w-3" />
                    By Value
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {analyticsData.categoryBreakdown.map((category, index) => {
                    const colors = [
                      'from-purple-500 to-pink-500',
                      'from-blue-500 to-cyan-500', 
                      'from-green-500 to-emerald-500',
                      'from-orange-500 to-red-500',
                      'from-indigo-500 to-purple-500'
                    ];
                    return (
                      <div key={category.category} className="group">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">{category.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-400">{category.count} items</span>
                            <span className="text-sm text-slate-400">{category.percentage.toFixed(1)}%</span>
                            <span className="text-sm font-medium text-white">{formatCurrency(category.value)}</span>
                          </div>
                        </div>
                        <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
                          <div 
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-1000 ease-out`}
                            style={{ 
                              width: `${getBarWidth(category.value, maxCategoryValue)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="mb-6 text-lg font-semibold text-white">Risk Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-300">Critical Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">{analyticsData.riskAnalysis.criticalItems} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-300">High Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">{analyticsData.riskAnalysis.highRiskItems} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-slate-300">Medium Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">{analyticsData.riskAnalysis.mediumRiskItems} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-300">Low Risk</span>
                      </div>
                      <span className="text-sm font-medium text-white">{analyticsData.riskAnalysis.lowRiskItems} items</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="mb-6 text-lg font-semibold text-white">Risk Recommendations</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Immediate Action Required</span>
                      </div>
                      <p className="mt-1 text-xs text-red-300">
                        {analyticsData.riskAnalysis.criticalItems} items need immediate liquidation strategies
                      </p>
                    </div>
                    <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">Monitor Closely</span>
                      </div>
                      <p className="mt-1 text-xs text-orange-300">
                        {analyticsData.riskAnalysis.highRiskItems} items should be reviewed weekly
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">AI Predictions</h3>
                  <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <BarChart3 className="mr-1 h-3 w-3" />
                    Next Month
                  </Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                    <h4 className="mb-2 text-sm font-medium text-slate-300">Predicted Dead Stock Value</h4>
                    <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.predictions.nextMonthDeadStock)}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {analyticsData.predictions.trendDirection === 'up' ? '↗' : analyticsData.predictions.trendDirection === 'down' ? '↘' : '→'} 
                      {analyticsData.predictions.trendDirection === 'up' ? ' Increasing trend' : 
                       analyticsData.predictions.trendDirection === 'down' ? ' Decreasing trend' : 
                       ' Stable trend'}
                    </p>
                  </div>
                  
                  <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                    <h4 className="mb-2 text-sm font-medium text-slate-300">Model Confidence</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                          style={{ width: `${analyticsData.predictions.confidenceLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white">{analyticsData.predictions.confidenceLevel}%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Based on 12 months of data</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
