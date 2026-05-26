import React, { useState } from 'react';

interface ParameterOptimizerProps {
  onOptimize: (params: Record<string, number>) => void;
}

const ParameterOptimizer: React.FC<ParameterOptimizerProps> = ({ onOptimize }) => {
  const [params, setParams] = useState({
    lotsFixed: 0.01,
    basketStopPct: 10,
    targetMultiplier: 1.5,
    maxPositions: 10,
    dailyCap: 50,
    pauseDD: 30,
  });

  const handleChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    onOptimize(params);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Parameter Optimizer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lots Fixed: {params.lotsFixed}</label>
          <input type="range" min="0.01" max="1" step="0.01" value={params.lotsFixed} onChange={(e) => handleChange('lotsFixed', parseFloat(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Basket Stop %: {params.basketStopPct}%</label>
          <input type="range" min="1" max="50" value={params.basketStopPct} onChange={(e) => handleChange('basketStopPct', parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Multiplier: {params.targetMultiplier}</label>
          <input type="range" min="0.5" max="10" step="0.5" value={params.targetMultiplier} onChange={(e) => handleChange('targetMultiplier', parseFloat(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Positions: {params.maxPositions}</label>
          <input type="range" min="1" max="50" value={params.maxPositions} onChange={(e) => handleChange('maxPositions', parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Daily Cap: ${params.dailyCap}</label>
          <input type="range" min="1" max="100" value={params.dailyCap} onChange={(e) => handleChange('dailyCap', parseInt(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pause DD %: {params.pauseDD}%</label>
          <input type="range" min="10" max="100" value={params.pauseDD} onChange={(e) => handleChange('pauseDD', parseInt(e.target.value))} className="w-full" />
        </div>
      </div>
      <button onClick={handleRun} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
        Run Optimization
      </button>
    </div>
  );
};

export default ParameterOptimizer;
