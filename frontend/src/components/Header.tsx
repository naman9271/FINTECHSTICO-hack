"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingDown, Zap, Settings, Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SmartStock</h1>
              <p className="text-xs text-slate-400">AI Inventory Analytics</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-400">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live Dashboard
            </Badge>
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-orange-400">
              <TrendingDown className="mr-1 h-3 w-3" />
              Dead Stock Alert
            </Badge>
            <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Zap className="mr-1 h-3 w-3" />
              AI Enabled
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
