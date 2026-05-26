import React, { useEffect } from 'react';
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
  const [currentView, setCurrentView] = React.useState<string>('upload');

  const theme = {
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#2563eb' },
      success: { main: '#10b981' },
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      background: {
        default: darkMode ? '#111827' : '#f3f4f6',
        paper: darkMode ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f9fafb' : '#111827',
        secondary: darkMode ? '#9ca3af' : '#6b7280',
      },
    },
  };

  // Load data from localStorage on mount
  useEffect(() => {
    useReportStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'upload': return <FileUploader />;
      case 'reports': return <ReportSummary />;
      case 'equity-curve': return <EquityCurve />;
      case 'trades': return <TradeTable />;
      case 'strategy': return <StrategyPerformanceBreakdown />;
      case 'risk': return <RiskAnalyzer />;
      case 'optimizer': return <ParameterOptimizer />;
      default: return <FileUploader />;
    }
  };

  return (
    <div style={{ 
      backgroundColor: theme.palette.background.default, 
      color: theme.palette.text.primary,
      minHeight: '100vh',
      fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif'
    }}>
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <div style={{ display: 'flex' }}>
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {renderView()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
