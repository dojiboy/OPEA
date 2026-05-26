import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Slider, TextField, Button, Card, CardContent } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestoreIcon from '@mui/icons-material/Restore';
import { useReportStore } from '../../store/reportStore';

interface OptimizerParameters {
  InpLotsFixed: number;
  InpBasketStopPct: number;
  InpTargetMultiplier: number;
  InpMaxTotalPositions: number;
  InpGlobalDailyCap: number;
  InpPauseEntryDDPct: number;
}

interface SimulationResult {
  originalProfit: number;
  simulatedProfit: number;
  profitChange: number;
  profitChangePercent: number;
  originalDrawdown: number;
  simulatedDrawdown: number;
  drawdownChange: number;
  originalTrades: number;
  simulatedTrades: number;
  tradeCountChange: number;
  originalWinRate: number;
  simulatedWinRate: number;
  winRateChange: number;
}

const ParameterOptimizer: React.FC = () => {
  const { reports } = useReportStore();
  
  const [parameters, setParameters] = useState<OptimizerParameters>({
    InpLotsFixed: 0.01,
    InpBasketStopPct: 10,
    InpTargetMultiplier: 1.0,
    InpMaxTotalPositions: 10,
    InpGlobalDailyCap: 50,
    InpPauseEntryDDPct: 30,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleParameterChange = (key: keyof OptimizerParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setParameters({
      InpLotsFixed: 0.01,
      InpBasketStopPct: 10,
      InpTargetMultiplier: 1.0,
      InpMaxTotalPositions: 10,
      InpGlobalDailyCap: 50,
      InpPauseEntryDDPct: 30,
    });
    setResult(null);
  };

  const simulateImpact = () => {
    setIsSimulating(true);
    
    // Get the latest report
    const latestReport = reports[reports.length - 1];
    
    if (!latestReport || !latestReport.trades || latestReport.trades.length === 0) {
      setIsSimulating(false);
      return;
    }

    // Simulate impact based on parameter changes
    // This is a simplified simulation - in real app, you'd replay trades with new params
    setTimeout(() => {
      const trades = latestReport.trades;
      const originalProfit = latestReport.summary?.totalNetProfit || 0;
      const originalDrawdown = latestReport.drawdown?.relativePercent || 0;
      const originalTrades = trades.length;
      
      const winningTrades = trades.filter(t => t.profit > 0);
      const originalWinRate = (winningTrades.length / originalTrades) * 100;

      // Simple simulation logic based on lot size and target multiplier
      const lotMultiplier = parameters.InpLotsFixed / 0.01;
      const targetMultiplier = parameters.InpTargetMultiplier;
      
      // Estimate new profit based on lot size and target multiplier
      const simulatedProfit = originalProfit * lotMultiplier * targetMultiplier;
      const profitChange = simulatedProfit - originalProfit;
      const profitChangePercent = originalProfit !== 0 ? (profitChange / Math.abs(originalProfit)) * 100 : 0;

      // Estimate drawdown change (higher lot size = higher drawdown)
      const drawdownMultiplier = 1 + (lotMultiplier - 1) * 0.8;
      const simulatedDrawdown = originalDrawdown * drawdownMultiplier;
      const drawdownChange = simulatedDrawdown - originalDrawdown;

      // Estimate trade count change (tighter stops = more trades, higher targets = fewer trades)
      const stopFactor = 1 + (10 - parameters.InpBasketStopPct) * 0.02;
      const targetFactor = 1 + (1 - parameters.InpTargetMultiplier) * 0.1;
      const simulatedTrades = Math.round(originalTrades * stopFactor * targetFactor);
      const tradeCountChange = simulatedTrades - originalTrades;

      // Estimate win rate change (higher targets might reduce win rate)
      const winRateAdjustment = (1 - parameters.InpTargetMultiplier) * 5;
      const simulatedWinRate = Math.max(0, Math.min(100, originalWinRate + winRateAdjustment));
      const winRateChange = simulatedWinRate - originalWinRate;

      setResult({
        originalProfit,
        simulatedProfit,
        profitChange,
        profitChangePercent,
        originalDrawdown,
        simulatedDrawdown,
        drawdownChange,
        originalTrades,
        simulatedTrades,
        tradeCountChange,
        originalWinRate,
        simulatedWinRate,
        winRateChange,
      });

      setIsSimulating(false);
    }, 1000);
  };

  const latestReport = reports[reports.length - 1];

  if (!latestReport) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No report data available. Please upload a backtest report first.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Parameter Optimizer Simulator
      </Typography>

      <Grid container spacing={3}>
        {/* Parameters Input */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <SettingsIcon />
              <Typography variant="subtitle1" fontWeight={600}>Adjust Parameters</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography gutterBottom>InpLotsFixed: {parameters.InpLotsFixed.toFixed(2)}</Typography>
                <Slider
                  value={parameters.InpLotsFixed}
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  onChange={(_, value) => handleParameterChange('InpLotsFixed', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>InpBasketStopPct: {parameters.InpBasketStopPct}%</Typography>
                <Slider
                  value={parameters.InpBasketStopPct}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(_, value) => handleParameterChange('InpBasketStopPct', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>InpTargetMultiplier: {parameters.InpTargetMultiplier.toFixed(1)}x</Typography>
                <Slider
                  value={parameters.InpTargetMultiplier}
                  min={0.5}
                  max={10}
                  step={0.5}
                  onChange={(_, value) => handleParameterChange('InpTargetMultiplier', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>InpMaxTotalPositions: {parameters.InpMaxTotalPositions}</Typography>
                <Slider
                  value={parameters.InpMaxTotalPositions}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(_, value) => handleParameterChange('InpMaxTotalPositions', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>InpGlobalDailyCap: ${parameters.InpGlobalDailyCap}</Typography>
                <Slider
                  value={parameters.InpGlobalDailyCap}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(_, value) => handleParameterChange('InpGlobalDailyCap', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={12}>
                <Typography gutterBottom>InpPauseEntryDDPct: {parameters.InpPauseEntryDDPct}%</Typography>
                <Slider
                  value={parameters.InpPauseEntryDDPct}
                  min={10}
                  max={100}
                  step={5}
                  onChange={(_, value) => handleParameterChange('InpPauseEntryDDPct', value as number)}
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={3}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={simulateImpact}
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating...' : 'Simulate Impact'}
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RestoreIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Simulation Results
            </Typography>

            {!result ? (
              <Typography color="text.secondary">
                Adjust parameters and click "Simulate Impact" to see the estimated results.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Card sx={{ bgcolor: result.profitChange >= 0 ? 'success.light' : 'error.light' }}>
                    <CardContent>
                      <Typography variant="subtitle2">Total Net Profit</Typography>
                      <Typography variant="h4" fontWeight={700}>
                        ${result.simulatedProfit.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={result.profitChange >= 0 ? 'success.dark' : 'error.dark'}
                      >
                        {result.profitChange >= 0 ? '+' : ''}${result.profitChange.toFixed(2)} ({result.profitChangePercent.toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Drawdown %</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {result.simulatedDrawdown.toFixed(2)}%
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={result.drawdownChange <= 0 ? 'success.main' : 'error.main'}
                      >
                        {result.drawdownChange >= 0 ? '+' : ''}{result.drawdownChange.toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Trade Count</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {result.simulatedTrades}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={result.tradeCountChange >= 0 ? 'info.main' : 'warning.main'}
                      >
                        {result.tradeCountChange >= 0 ? '+' : ''}{result.tradeCountChange}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Win Rate</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="h5" fontWeight={700}>
                          {result.simulatedWinRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Original: {result.originalWinRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color={result.winRateChange >= 0 ? 'success.main' : 'error.main'}
                      >
                        {result.winRateChange >= 0 ? '+' : ''}{result.winRateChange.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Note: This is an estimation based on historical data. Actual results may vary depending on market conditions.
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParameterOptimizer;
