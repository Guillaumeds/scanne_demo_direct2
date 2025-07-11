import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { NestedTableApproach } from '../components/NestedTableApproach';
import { BlocNode } from '../types/TableTypes';
import { sampleBlocData } from '../data/sampleData';

// Create a theme (optional - you can use your existing theme)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#2e7d32',
    },
  },
});

export const BasicUsageExample: React.FC = () => {
  const [tableData, setTableData] = useState<BlocNode[]>(sampleBlocData);

  const handleDataChange = (newData: BlocNode[]) => {
    console.log('Data changed:', newData);
    setTableData(newData);
    // Here you could save to your backend, localStorage, etc.
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Agricultural Data Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your agricultural blocs, products, and daily work packages
          </Typography>
        </Box>

        <NestedTableApproach
          initialData={tableData}
          onDataChange={handleDataChange}
          readOnly={false}
          showSummary={true}
        />
      </Container>
    </ThemeProvider>
  );
};

// Example with custom configuration
export const CustomConfigExample: React.FC = () => {
  const [data, setData] = useState<BlocNode[]>([]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <NestedTableApproach
          initialData={data}
          onDataChange={setData}
          readOnly={false}
          showSummary={true}
        />
      </Container>
    </ThemeProvider>
  );
};

// Read-only example
export const ReadOnlyExample: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <NestedTableApproach
          initialData={sampleBlocData}
          readOnly={true}
          showSummary={true}
        />
      </Container>
    </ThemeProvider>
  );
};
