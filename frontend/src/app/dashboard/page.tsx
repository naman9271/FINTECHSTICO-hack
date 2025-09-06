"use client";


import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  BarChart3,
  Package,
  Brain,
  FileText,
  TrendingUp,
  AlertTriangle,
  Users,
  Zap,
  Shield,
  Clock,
  Target,
  CheckCircle,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Advanced Analytics",
      description: "Deep dive into your inventory performance with comprehensive charts and insights",
      href: "/analytics",
      color: "blue"
    },
    {
      icon: <Package className="h-8 w-8 text-green-600" />,
      title: "Inventory Management",
      description: "Complete CRUD operations for managing your products and stock levels",
      href: "/inventory",
      color: "green"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI Assistant",
      description: "Get intelligent insights and answers about your inventory using natural language",
      href: "/ai-assistant",
      color: "purple"
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Reports & Export",
      description: "Generate comprehensive reports and export data in multiple formats",
      href: "/reports",
      color: "orange"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      title: "Reduce Dead Stock by 40%",
      description: "AI-powered predictions help prevent inventory stagnation"
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      title: "Early Risk Detection",
      description: "Identify potential dead stock before it becomes a problem"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Save 10+ Hours Weekly",
      description: "Automated insights eliminate manual inventory analysis"
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: "Smart Recommendations",
      description: "Get actionable insights for inventory optimization"
    }
  ];

  const stats = [
    { label: "Active Users", value: "2,500+", growth: "+12%" },
    { label: "Dead Stock Reduced", value: "$2.3M", growth: "+40%" },
    { label: "Time Saved", value: "15,000hrs", growth: "+25%" },
    { label: "Accuracy Rate", value: "99.2%", growth: "+5%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Smart Dead Stock Management Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform your inventory management with AI-powered insights. 
                Reduce dead stock, optimize inventory turnover, and make data-driven decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/analytics">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                    Explore Analytics
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/ai-assistant">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4">
                    Try AI Assistant
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {stat.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Complete Inventory Intelligence Suite
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage, analyze, and optimize your inventory in one powerful platform.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {features.map((feature, index) => (
                <Link key={index} href={feature.href}>
                  <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-200 bg-white h-full group cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-${feature.color}-50 group-hover:bg-${feature.color}-100 transition-colors`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                          <span className="text-sm font-medium">Explore feature</span>
                          <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose SmartStock?
              </h2>
              <p className="text-xl text-gray-600">
                Proven results that drive real business impact
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Simple steps to transform your inventory management
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Connect Your Data</h3>
                <p className="text-gray-600">
                  Import your inventory data or connect existing systems seamlessly
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI analyzes patterns and identifies dead stock risks automatically
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Take Action</h3>
                <p className="text-gray-600">
                  Get actionable insights and implement optimization strategies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Optimize Your Inventory?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that have reduced dead stock and improved efficiency with SmartStock.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analytics">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4">
                  Start Analytics
                  <BarChart3 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-4">
                  Try AI Assistant
                  <Brain className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
