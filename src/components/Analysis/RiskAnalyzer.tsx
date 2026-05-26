import React from 'react';

interface Trade {
  profit: number;
}

interface RiskAnalyzerProps {
  trades: Trade[];
  totalProfit: number;
}

const RiskAnalyzer: React.FC<RiskAnalyzerProps> = ({ trades, totalProfit }) => {
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit <= 0);
  
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length 
    : 0;
  
  const avgLoss = losingTrades.length > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length) 
    : 0;
  
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
  const riskOfRuin = expectancy > 0 ? Math.exp(-2 * expectancy * trades.length / (avgWin * avgWin + avgLoss * avgLoss)) * 100 : 100;

  const metrics = [
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? 'text-green-600' : 'text-red-600' },
    { label: 'Profit Factor', value: profitFactor.toFixed(2), color: profitFactor >= 1.5 ? 'text-green-600' : 'text-yellow-600' },
    { label: 'Expectancy', value: `$${expectancy.toFixed(2)}`, color: expectancy > 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'Risk of Ruin', value: `${Math.min(riskOfRuin, 100).toFixed(1)}%`, color: riskOfRuin < 20 ? 'text-green-600' : riskOfRuin < 50 ? 'text-yellow-600' : 'text-red-600' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Risk Analysis</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAnalyzer;
