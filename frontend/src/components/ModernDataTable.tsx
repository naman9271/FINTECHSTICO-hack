"use client";

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/Pagination';
import { MoreHorizontal, AlertTriangle, Package, DollarSign, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DeadStockItem {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  totalValue: number;
  daysSinceLastSale: number;
  monthlyStorageCost: number;
}

interface ModernDataTableProps {
  data: DeadStockItem[];
  loading?: boolean;
}

export function ModernDataTable({ data, loading = false }: ModernDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and pagination logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getRiskLevel = (daysSinceLastSale: number, totalValue: number) => {
    if (daysSinceLastSale > 365 || totalValue > 50000) return 'Critical';
    if (daysSinceLastSale > 180 || totalValue > 20000) return 'High';
    if (daysSinceLastSale > 90 || totalValue > 10000) return 'Medium';
    return 'Low';
  };

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
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-orange-400">
              <Package className="mr-1 h-3 w-3" />
              {filteredData.length} Items
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-700 bg-slate-800/50 text-white placeholder-slate-400 focus:border-purple-500"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-slate-800/50 bg-slate-950/50">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                <TableHead className="text-slate-300">Product</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300 text-right">Quantity</TableHead>
                <TableHead className="text-slate-300 text-right">Purchase Price</TableHead>
                <TableHead className="text-slate-300 text-right">Days Stagnant</TableHead>
                <TableHead className="text-slate-300 text-right">Total Value</TableHead>
                <TableHead className="text-slate-300 text-right">Monthly Storage Cost</TableHead>
                <TableHead className="text-slate-300">Risk Level</TableHead>
                <TableHead className="text-slate-300 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
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
                    {formatCurrency(item.purchasePrice)}
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    <div className="flex items-center justify-end space-x-1">
                      <span>{item.daysSinceLastSale || 'N/A'}</span>
                      {item.daysSinceLastSale && item.daysSinceLastSale > 180 && (
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={`${
                      item.totalValue > 10000 ? 'text-red-400' : 
                      item.totalValue > 5000 ? 'text-orange-400' : 
                      'text-slate-300'
                    }`}>
                      {formatCurrency(item.totalValue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">
                    {formatCurrency(item.monthlyStorageCost)}
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(getRiskLevel(item.daysSinceLastSale || 0, item.totalValue))}
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

        {filteredData.length === 0 && searchTerm && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-slate-400">No items found matching "{searchTerm}"</p>
            <p className="text-sm text-slate-500">Try adjusting your search terms</p>
          </div>
        )}

        {data.length === 0 && !searchTerm && (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-2 text-slate-400">No dead stock items found</p>
            <p className="text-sm text-slate-500">Your inventory is healthy!</p>
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </Card>
  );
}
