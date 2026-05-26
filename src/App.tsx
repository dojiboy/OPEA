import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSettingsStore } from './store/settingsStore';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import FileUploader from './components/Upload/FileUploader';
import ReportSummary from './components/Reports/ReportSummary';
import EquityCurve from './components/Charts/EquityCurve';
import TradeTable from './components/Tables/TradeTable';
import StrategyPerformanceBreakdown from './components/Analysis/StrategyPerformanceBreakdown';
import RiskAnalyzer from './components/Analysis/RiskAnalyzer';
import ParameterOptimizer from './components/Analysis/ParameterOptimizer';
import ToastContainer from './components/Common/ToastContainer';
import { useReportStore } from './store/reportStore';

const App: React.FC = () => {
  const { darkMode } = useSettingsStore();
  const { reports } = useReportStore();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
      },
      success: {
        main: '#10b981',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });

  // Load data from localStorage on mount
  useEffect(() => {
    useReportStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <div style={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/upload" replace />} />
                <Route path="/upload" element={<FileUploader />} />
                <Route path="/reports" element={<ReportSummary />} />
                <Route path="/equity-curve" element={<EquityCurve />} />
                <Route path="/trades" element={<TradeTable />} />
                <Route path="/strategy" element={<StrategyPerformanceBreakdown />} />
                <Route path="/risk" element={<RiskAnalyzer />} />
                <Route path="/optimizer" element={<ParameterOptimizer />} />
              </Routes>
            </main>
          </div>
          <ToastContainer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
