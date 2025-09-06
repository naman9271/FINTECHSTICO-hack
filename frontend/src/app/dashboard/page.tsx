'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Alert, AppBar, Toolbar, Tabs, Tab, Box } from '@mui/material';
import axios from 'axios';
import FinancialSummaryComponent from '../../components/FinancialSummary';
import DeadStockTable from '../../components/DeadStockTable';
import DeadStockValueChart from '../../components/DeadStockValueChart';
import NLQueryInterface from '../../components/NLQueryInterface';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/deadstock`, {
          params: { days_since_last_sale: 90, min_quantity: 1 }
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
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>No data available.</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Dead Stock Management Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
            <FinancialSummaryComponent summary={data.summary} />

            {/* Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <DeadStockValueChart data={data.items} />
                </CardContent>
              </Card>
            </Grid>

            {/* Dead Stock Table */}
            <Grid item xs={12}>
              <DeadStockTable items={data.items} />
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
