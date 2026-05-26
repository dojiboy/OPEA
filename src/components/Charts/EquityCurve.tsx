import React, { useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';

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
        mode: 1,
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

    const balanceSeries = chart.addLineSeries({
      color: '#2563eb',
      lineWidth: 2,
      title: 'Balance',
    });
    balanceSeriesRef.current = balanceSeries;

    const equitySeries = chart.addLineSeries({
      color: '#10b981',
      lineWidth: 2,
      title: 'Equity',
    });
    equitySeriesRef.current = equitySeries;

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex gap-1">
          <button onClick={handleZoomIn} title="Zoom In" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m0 0v3m0-6H7m3 0H7" /></svg>
          </button>
          <button onClick={handleReset} title="Reset View" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button onClick={handleExport} title="Export Chart" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        style={{ width: '100%', height: height - 60 }}
        className="relative"
      />
      {data.length === 0 && (
        <div className="flex justify-center items-center text-gray-500 dark:text-gray-400" style={{ height: height - 60 }}>
          <p>No chart data available. Upload a report file to see the equity curve.</p>
        </div>
      )}
    </div>
  );
};

export default EquityCurve;
