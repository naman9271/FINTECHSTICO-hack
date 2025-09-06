"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingDown, 
  Zap, 
  Settings, 
  Bell, 
  User,
  Home,
  Package,
  Brain,
  FileText,
  PieChart
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: PieChart },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '/ai-assistant', label: 'AI Assistant', icon: Brain },
    { href: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartStock</h1>
                <p className="text-xs text-gray-600">AI Inventory Analytics</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${
                      isActive ? 'text-gray-900 bg-gray-100' : ''
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Dashboard
            </Badge>
            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
              <TrendingDown className="mr-1 h-3 w-3" />
              Dead Stock Alert
            </Badge>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              <Zap className="mr-1 h-3 w-3" />
              AI Enabled
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
