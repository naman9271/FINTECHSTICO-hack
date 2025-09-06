"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  description,
  className = ""
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'down':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card className={`relative overflow-hidden border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-sm ${className}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
          
          {change !== undefined && (
            <Badge variant="outline" className={getTrendColor()}>
              {getTrendIcon()}
              <span className="ml-1 text-xs">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="mt-3 text-xs text-slate-500">{description}</p>
        )}
      </div>
    </Card>
  );
}
