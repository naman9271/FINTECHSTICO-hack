'use client';

import { Grid, Card, CardContent, Typography } from '@mui/material';

interface FinancialSummary {
  totalDeadStockValue: number;
  totalItems: number;
  estimatedTotalMonthlyStorageCost: number;
  potentialProfitLoss: number;
}

interface FinancialSummaryComponentProps {
  summary: FinancialSummary | null | undefined;
}

export default function FinancialSummaryComponent({ summary }: FinancialSummaryComponentProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Return empty fragment if no summary data
  if (!summary) {
    return <></>;
  }

  // Provide default values in case some properties are missing
  const safeData = {
    totalDeadStockValue: summary.totalDeadStockValue || 0,
    totalItems: summary.totalItems || 0,
    estimatedTotalMonthlyStorageCost: summary.estimatedTotalMonthlyStorageCost || 0,
    potentialProfitLoss: summary.potentialProfitLoss || 0,
  };

  return (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Dead Stock Value
            </Typography>
            <Typography variant="h4" component="div" color="error">
              {formatCurrency(safeData.totalDeadStockValue)}
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
              {safeData.totalItems.toLocaleString()}
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
              {formatCurrency(safeData.estimatedTotalMonthlyStorageCost)}
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
              {formatCurrency(safeData.potentialProfitLoss)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}
