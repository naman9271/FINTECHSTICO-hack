'use client';

import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

interface DeadStockItem {
  productId: string;
  sku: string;
  productName: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  totalValue: number;
  lastSaleDate: string | null;
  daysSinceLastSale: number | null;
  monthlyStorageCost: number;
}

interface DeadStockTableProps {
  items: DeadStockItem[] | null | undefined;
}

export default function DeadStockTable({ items }: DeadStockTableProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Return empty table if no items
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dead Stock Items
          </Typography>
          <Typography>No dead stock items found.</Typography>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (days: number | null) => {
    if (!days) return { label: 'Critical', color: 'error' as const };
    if (days > 180) return { label: 'Critical', color: 'error' as const };
    if (days > 90) return { label: 'High', color: 'warning' as const };
    return { label: 'Medium', color: 'info' as const };
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dead Stock Items ({items.length} items)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell>Last Sale</TableCell>
                <TableCell align="right">Days Since Sale</TableCell>
                <TableCell align="right">Monthly Storage Cost</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const risk = getRiskLevel(item.daysSinceLastSale);
                return (
                  <TableRow key={item.productId}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalValue)}</TableCell>
                    <TableCell>{formatDate(item.lastSaleDate)}</TableCell>
                    <TableCell align="right">{item.daysSinceLastSale || 'N/A'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.monthlyStorageCost)}</TableCell>
                    <TableCell>
                      <Chip label={risk.label} color={risk.color} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
