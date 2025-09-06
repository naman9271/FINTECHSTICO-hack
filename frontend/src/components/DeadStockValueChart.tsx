'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

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

interface DeadStockValueChartProps {
  data: DeadStockItem[] | null | undefined;
}

const DeadStockValueChart = ({ data }: DeadStockValueChartProps) => {
  // Return empty chart if no data
  if (!data || data.length === 0) {
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Dead Stock Value by Product
        </Typography>
        <Typography>No data available for chart.</Typography>
      </div>
    );
  }

  // Get top 10 items by total value
  const chartData = data
   .slice()
   .sort((a, b) => b.totalValue - a.totalValue)
   .slice(0, 10);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Top 10 Dead Stock Items by Value
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sku" />
          <YAxis />
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend />
          <Bar dataKey="totalValue" fill="#8884d8" name="Total Stock Value" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default DeadStockValueChart;
