'use client';

import { Grid, Card, CardContent, Typography } from '@mui/material';

interface FinancialSummary {
  total_dead_stock_value: number;
  total_items: number;
  estimated_total_monthly_storage_cost: number;
  potential_profit_loss: number;
}

interface FinancialSummaryComponentProps {
  summary: FinancialSummary;
}

export default function FinancialSummaryComponent({ summary }: FinancialSummaryComponentProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Dead Stock Value
            </Typography>
            <Typography variant="h4" component="div" color="error">
              {formatCurrency(summary.total_dead_stock_value)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Items
            </Typography>
            <Typography variant="h4" component="div">
              {summary.total_items.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Monthly Storage Cost
            </Typography>
            <Typography variant="h4" component="div" color="warning.main">
              {formatCurrency(summary.estimated_total_monthly_storage_cost)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Potential Profit Loss
            </Typography>
            <Typography variant="h4" component="div" color="error">
              {formatCurrency(summary.potential_profit_loss)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}
