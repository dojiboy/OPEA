import React, { useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Box, Paper, Typography, ButtonGroup, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ResetTvIcon from '@mui/icons-material/Refresh';

interface ChartDataPoint {
  time: number;
  balance: number;
  equity: number;
}

interface EquityCurveProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
}

const EquityCurve: React.FC<EquityCurveProps> = ({ 
  data, 
  title = 'Equity Curve', 
  height = 400 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const balanceSeriesRef = useRef<ISeriesApi<'Line'>>();
  const equitySeriesRef = useRef<ISeriesApi<'Line'>>();

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Balance Series
    const balanceSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
      title: 'Balance',
    });
    balanceSeriesRef.current = balanceSeries;

    // Equity Series
    const equitySeries = chart.addLineSeries({
      color: '#10b981',
      lineWidth: 2,
      title: 'Equity',
    });
    equitySeriesRef.current = equitySeries;

    // Transform data for lightweight-charts
    const balanceData = data.map(d => ({
      time: (d.time / 1000) as Time,
      value: d.balance,
    }));

    const equityData = data.map(d => ({
      time: (d.time / 1000) as Time,
      value: d.equity,
    }));

    balanceSeries.setData(balanceData);
    equitySeries.setData(equityData);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  const handleExport = () => {
    if (!chartRef.current) return;
    // Lightweight charts doesn't have built-in export, would need html2canvas
    alert('Export feature coming soon!');
  };

  const handleZoomIn = () => {
    if (chartRef.current) {
      const visibleRange = chartRef.current.timeScale().getVisibleLogicalRange();
      if (visibleRange) {
        const newRange = {
          from: visibleRange.from + 50,
          to: visibleRange.to - 50,
        };
        chartRef.current.timeScale().setVisibleLogicalRange(newRange);
      }
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      const visibleRange = chartRef.current.timeScale().getVisibleLogicalRange();
      if (visibleRange) {
        const newRange = {
          from: visibleRange.from - 50,
          to: visibleRange.to + 50,
        };
        chartRef.current.timeScale().setVisibleLogicalRange(newRange);
      }
    }
  };

  const handleReset = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <ButtonGroup size="small">
          <Button onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon />
          </Button>
          <Button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon />
          </Button>
          <Button onClick={handleReset} title="Reset View">
            <ResetTvIcon />
          </Button>
          <Button onClick={handleExport} title="Export Chart">
            <DownloadIcon />
          </Button>
        </ButtonGroup>
      </Box>
      <Box 
        ref={chartContainerRef} 
        sx={{ 
          width: '100%', 
          height: height - 60,
          '& .legend-container': { position: 'absolute', left: 12, top: 12, zIndex: 1 }
        }} 
      />
      {data.length === 0 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={height - 60}
          sx={{ color: 'text.secondary' }}
        >
          <Typography>No chart data available. Upload a report file to see the equity curve.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EquityCurve;
