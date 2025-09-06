"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, BarChart3, DollarSign } from 'lucide-react';

interface ChartData {
  category: string;
  value: number;
  percentage: number;
}

interface ModernChartProps {
  data: ChartData[];
  title: string;
  totalValue: number;
  loading?: boolean;
}

export function ModernChart({ data, title, totalValue, loading = false }: ModernChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBarColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-purple-500 to-pink-500',
      'bg-gradient-to-r from-blue-500 to-cyan-500',
      'bg-gradient-to-r from-green-500 to-emerald-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500',
      'bg-gradient-to-r from-pink-500 to-rose-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-b-purple-500"></div>
          <p className="mt-2 text-slate-400">Loading chart data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">Dead stock value distribution by category</p>
          </div>
          <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400">
            <DollarSign className="mr-1 h-3 w-3" />
            {formatCurrency(totalValue)}
          </Badge>
        </div>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.category} className="group">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">{item.percentage.toFixed(1)}%</span>
                  <span className="text-sm font-medium text-white">{formatCurrency(item.value)}</span>
                </div>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-800">
                <div 
                  className={`h-full ${getBarColor(index)} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${(item.value / maxValue) * 100}%`,
                    animation: `slideIn 1s ease-out ${index * 0.1}s both`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-slate-400">No chart data available</p>
            <p className="text-sm text-slate-500">Dead stock analysis will appear here</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <TrendingDown className="h-4 w-4" />
              <span>Total Dead Stock Value</span>
            </div>
            <span className="font-medium text-white">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: ${(100)}%;
          }
        }
      `}</style>
    </Card>
  );
}
