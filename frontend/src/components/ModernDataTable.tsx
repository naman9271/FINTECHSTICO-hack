"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, AlertTriangle, Package, DollarSign } from 'lucide-react';

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

interface ModernDataTableProps {
  data: DeadStockItem[];
  loading?: boolean;
}

export function ModernDataTable({ data, loading = false }: ModernDataTableProps) {
  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      'Low': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'Critical': 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    
    return (
      <Badge variant="outline" className={variants[riskLevel as keyof typeof variants]}>
        {riskLevel === 'Critical' && <AlertTriangle className="mr-1 h-3 w-3" />}
        {riskLevel}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-b-purple-500"></div>
          <p className="mt-2 text-slate-400">Loading dead stock data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Dead Stock Analysis</h3>
            <p className="text-sm text-slate-400">Items at risk of becoming obsolete inventory</p>
          </div>
          <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-orange-400">
            <Package className="mr-1 h-3 w-3" />
            {data.length} Items
          </Badge>
        </div>

        <div className="rounded-lg border border-slate-800/50 bg-slate-950/50">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                <TableHead className="text-slate-300">Product</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300 text-right">Quantity</TableHead>
                <TableHead className="text-slate-300 text-right">Original Cost</TableHead>
                <TableHead className="text-slate-300 text-right">Days Stagnant</TableHead>
                <TableHead className="text-slate-300 text-right">Potential Loss</TableHead>
                <TableHead className="text-slate-300">Risk Level</TableHead>
                <TableHead className="text-slate-300 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow 
                  key={item._id} 
                  className="border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                >
                  <TableCell className="font-medium text-white">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {item.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {formatCurrency(item.originalCost)}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    <div className="flex items-center justify-end space-x-1">
                      <span>{item.daysSinceLastSale}</span>
                      {item.daysSinceLastSale > 180 && (
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={`${
                      item.potentialLoss > 10000 ? 'text-red-400' : 
                      item.potentialLoss > 5000 ? 'text-orange-400' : 
                      'text-slate-300'
                    }`}>
                      {formatCurrency(item.potentialLoss)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(item.riskLevel)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-slate-400">No dead stock items found</p>
            <p className="text-sm text-slate-500">Your inventory is healthy!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
