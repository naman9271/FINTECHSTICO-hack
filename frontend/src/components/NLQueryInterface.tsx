'use client';

import { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function NLQueryInterface() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post(`${API_URL}/api/query`, { question: query });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError('An error occurred while processing your query.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!result || !result.results || result.results.length === 0) {
      return <Typography>No results found.</Typography>;
    }

    const headers = Object.keys(result.results[0]);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map(header => <TableCell key={header}>{header}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {result.results.map((row: any, index: number) => (
              <TableRow key={index}>
                {headers.map(header => <TableCell key={header}>{String(row[header])}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Ask a Question</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Try questions like: "Show me the top 5 most expensive products" or "Which products had no sales in the last 90 days?"
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Enter your question in plain English"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
        />
        <Button variant="contained" onClick={handleQuery} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Query'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Results</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace', p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            Generated SQL: {result.sql_query}
          </Typography>
          {renderTable()}
        </Box>
      )}
    </Box>
  );
}
