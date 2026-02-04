import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import theme from './theme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CardComparisonPage from './pages/CardComparisonPage';
import CardDetailsPage from './pages/CardDetailsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationReviewPage from './pages/ApplicationReviewPage';
import ApplicationConfirmationPage from './pages/ApplicationConfirmationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cards" element={<CardComparisonPage />} />
                <Route path="/cards/:id" element={<CardDetailsPage />} />
                <Route path="/apply/:cardId" element={<ApplicationFormPage />} />
                <Route path="/apply/:cardId/review" element={<ApplicationReviewPage />} />
                <Route path="/apply/:cardId/confirmation" element={<ApplicationConfirmationPage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
