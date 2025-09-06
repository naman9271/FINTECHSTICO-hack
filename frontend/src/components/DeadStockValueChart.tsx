'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

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

interface DeadStockValueChartProps {
  data: DeadStockItem[];
}

const DeadStockValueChart = ({ data }: DeadStockValueChartProps) => {
  // Get top 10 items by total value
  const chartData = data
   .slice()
   .sort((a, b) => b.total_value - a.total_value)
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
          <Bar dataKey="total_value" fill="#8884d8" name="Total Stock Value" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default DeadStockValueChart;
