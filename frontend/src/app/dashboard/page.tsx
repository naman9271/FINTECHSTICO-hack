'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Alert, AppBar, Toolbar, Tabs, Tab, Box } from '@mui/material';
import axios from 'axios';
import FinancialSummaryComponent from '../../components/FinancialSummary';
import DeadStockTable from '../../components/DeadStockTable';
import DeadStockValueChart from '../../components/DeadStockValueChart';
import NLQueryInterface from '../../components/NLQueryInterface';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ApiResponse {
  success: boolean;
  data: {
    summary: {
      totalDeadStockValue: number;
      totalItems: number;
      estimatedTotalMonthlyStorageCost: number;
      potentialProfitLoss: number;
    };
    items: Array<{
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
    }>;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/deadstock`, {
          params: { daysSinceLastSale: 90, minQuantity: 1 }
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch dead stock data. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mounted]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="xl" style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Typography>No data available.</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
            Smart Dead Stock Management Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Box style={{ borderBottom: '1px solid #e0e0e0' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Dashboard Overview" />
            <Tab label="Ask Questions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" gutterBottom>
            Dead Stock Dashboard
          </Typography>
          <Grid container spacing={3}>
            {/* Financial Summary Cards */}
            {data?.data?.summary && <FinancialSummaryComponent summary={data.data.summary} />}

            {/* Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  {data?.data?.items && <DeadStockValueChart data={data.data.items} />}
                </CardContent>
              </Card>
            </Grid>

            {/* Dead Stock Table */}
            <Grid item xs={12}>
              {data?.data?.items && <DeadStockTable items={data.data.items} />}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NLQueryInterface />
        </TabPanel>
      </Container>
    </>
  );
}
