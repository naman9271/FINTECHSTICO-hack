'use client';

import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

interface DeadStockItem {
  product_id: number;
  sku: string;
  product_name: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  total_value: number;
  last_sale_date: string | null;
  days_since_last_sale: number | null;
  estimated_monthly_storage_cost: number;
}

interface DeadStockTableProps {
  items: DeadStockItem[];
}

export default function DeadStockTable({ items }: DeadStockTableProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US');
  };

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
                const risk = getRiskLevel(item.days_since_last_sale);
                return (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total_value)}</TableCell>
                    <TableCell>{formatDate(item.last_sale_date)}</TableCell>
                    <TableCell align="right">{item.days_since_last_sale || 'N/A'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.estimated_monthly_storage_cost)}</TableCell>
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
