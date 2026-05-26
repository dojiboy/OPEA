import React from 'react';

interface Trade {
  strategyId?: string;
  profit: number;
  closeTime: number;
  openTime: number;
}

interface StrategyPerformanceBreakdownProps {
  trades: Trade[];
}

const StrategyPerformanceBreakdown: React.FC<StrategyPerformanceBreakdownProps> = ({ trades }) => {
  const strategies = trades.reduce((acc, trade) => {
    const id = trade.strategyId || 'Unknown';
    if (!acc[id]) {
      acc[id] = { trades: [], profit: 0, wins: 0, losses: 0 };
    }
    acc[id].trades.push(trade);
    acc[id].profit += trade.profit;
    if (trade.profit > 0) acc[id].wins++;
    else acc[id].losses++;
    return acc;
  }, {} as Record<string, { trades: Trade[]; profit: number; wins: number; losses: number }>);

  const strategyStats = Object.entries(strategies).map(([id, data]) => ({
    id,
    totalTrades: data.trades.length,
    profit: data.profit,
    winRate: ((data.wins / data.trades.length) * 100).toFixed(1),
    avgProfit: (data.profit / data.trades.length).toFixed(2),
  })).sort((a, b) => b.profit - a.profit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Strategy Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trades</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {strategyStats.map((stat) => (
              <tr key={stat.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{stat.id}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{stat.totalTrades}</td>
                <td className={`px-4 py-2 text-sm font-medium ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${stat.profit.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{stat.winRate}%</td>
                <td className={`px-4 py-2 text-sm ${parseFloat(stat.avgProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${stat.avgProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyPerformanceBreakdown;
