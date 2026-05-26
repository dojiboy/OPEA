import React from 'react';
import { BacktestReport } from '../../types/report';

interface ReportSummaryProps {
  report: BacktestReport;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ report }) => {
  const { summary, trades, drawdown } = report;

  const stats = [
    {
      title: 'Total Net Profit',
      value: `$${summary.totalNetProfit.toFixed(2)}`,
      color: summary.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Profit Factor',
      value: summary.profitFactor.toFixed(2),
      color: summary.profitFactor >= 1.5 ? 'text-green-600' : summary.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      title: 'Total Trades',
      value: trades.total.toString(),
      color: 'text-blue-600',
    },
    {
      title: 'Win Rate',
      value: `${trades.winRate.toFixed(1)}%`,
      color: trades.winRate >= 50 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Max Drawdown',
      value: `$${drawdown.relative.toFixed(2)}`,
      color: 'text-red-600',
    },
    {
      title: 'Recovery Factor',
      value: summary.recoveryFactor.toFixed(2),
      color: summary.recoveryFactor >= 3 ? 'text-green-600' : 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
          <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ReportSummary;
