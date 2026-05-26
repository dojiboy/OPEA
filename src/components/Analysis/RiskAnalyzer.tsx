import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, LinearProgress, Alert } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useReportStore } from '../../store/reportStore';

interface RiskMetrics {
  riskOfRuin: number;
  expectedValue: number;
  avgConsecutiveWins: number;
  avgConsecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  profitFactorDistribution: {
    mean: number;
    stdDev: number;
  };
  kellyCriterion: number;
  var95: number;
  var99: number;
}

const RiskAnalyzer: React.FC = () => {
  const { reports } = useReportStore();
  const [monteCarloResults, setMonteCarloResults] = useState<{
    iterations: number;
    successRate: number;
    avgFinalBalance: number;
    worstCase: number;
    bestCase: number;
    confidenceInterval: { lower: number; upper: number };
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const calculateRiskMetrics = (): RiskMetrics | null => {
    const latestReport = reports[reports.length - 1];
    if (!latestReport || !latestReport.trades || latestReport.trades.length === 0) {
      return null;
    }

    const trades = latestReport.trades;
    const profits = trades.map(t => t.profit || 0);
    
    // Basic stats
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);
    const winRate = winningTrades.length / totalTrades;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length) 
      : 0;
    
    // Expected Value
    const expectedValue = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    
    // Risk of Ruin (simplified formula)
    const riskOfRuin = avgLoss > 0 && avgWin > 0 
      ? Math.pow((1 - winRate) / winRate, (avgWin / avgLoss)) * 100 
      : 100;
    
    // Consecutive wins/losses analysis
    let currentStreak = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let consecutiveWinsSum = 0;
    let consecutiveLossesSum = 0;
    let winStreakCount = 0;
    let lossStreakCount = 0;
    let lastWasWin: boolean | null = null;

    trades.forEach(trade => {
      const isWin = trade.profit > 0;
      
      if (isWin) {
        if (lastWasWin === true) {
          currentStreak++;
        } else {
          if (lastWasWin === false && currentStreak > 0) {
            consecutiveLossesSum += currentStreak;
            lossStreakCount++;
          }
          currentStreak = 1;
        }
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentStreak);
        lastWasWin = true;
      } else if (trade.profit < 0) {
        if (lastWasWin === false) {
          currentStreak++;
        } else {
          if (lastWasWin === true && currentStreak > 0) {
            consecutiveWinsSum += currentStreak;
            winStreakCount++;
          }
          currentStreak = 1;
        }
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
        lastWasWin = false;
      }
    });
    
    // Final streak
    if (lastWasWin === true) {
      consecutiveWinsSum += currentStreak;
      winStreakCount++;
    } else if (lastWasWin === false) {
      consecutiveLossesSum += currentStreak;
      lossStreakCount++;
    }

    const avgConsecutiveWins = winStreakCount > 0 ? consecutiveWinsSum / winStreakCount : 0;
    const avgConsecutiveLosses = lossStreakCount > 0 ? consecutiveLossesSum / lossStreakCount : 0;

    // Profit Factor Distribution
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999.99 : 0;
    
    // Simplified std dev calculation
    const profitFactorDistribution = {
      mean: profitFactor,
      stdDev: profitFactor * 0.2 // Estimate 20% variance
    };

    // Kelly Criterion
    const kellyCriterion = winRate > 0 && avgWin > 0 && avgLoss > 0
      ? ((winRate * (avgWin / avgLoss)) - (1 - winRate)) * 100
      : 0;

    // Value at Risk (VaR) - Historical method
    const sortedProfits = [...profits].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedProfits.length * 0.05);
    const var99Index = Math.floor(sortedProfits.length * 0.01);
    const var95 = Math.abs(sortedProfits[var95Index] || 0);
    const var99 = Math.abs(sortedProfits[var99Index] || 0);

    return {
      riskOfRuin: Math.min(100, Math.max(0, riskOfRuin)),
      expectedValue,
      avgConsecutiveWins,
      avgConsecutiveLosses,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      profitFactorDistribution,
      kellyCriterion: Math.min(100, Math.max(0, kellyCriterion)),
      var95,
      var99,
    };
  };

  const runMonteCarloSimulation = () => {
    setIsRunning(true);
    
    const latestReport = reports[reports.length - 1];
    if (!latestReport || !latestReport.trades || latestReport.trades.length === 0) {
      setIsRunning(false);
      return;
    }

    const trades = latestReport.trades;
    const initialBalance = latestReport.general?.initialDeposit || 10000;
    
    // Extract trade statistics
    const profits = trades.map(t => t.profit || 0);
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    const stdDev = Math.sqrt(profits.reduce((sum, p) => sum + Math.pow(p - avgProfit, 2), 0) / profits.length);
    const winRate = profits.filter(p => p > 0).length / profits.length;

    const iterations = 1000;
    const tradesPerSimulation = trades.length;
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      let balance = initialBalance;
      
      for (let j = 0; j < tradesPerSimulation; j++) {
        // Random trade result based on historical distribution
        const randomProfit = avgProfit + (Math.random() - 0.5) * 2 * stdDev;
        balance += randomProfit;
        
        if (balance <= 0) {
          balance = 0;
          break;
        }
      }
      
      results.push(balance);
    }

    results.sort((a, b) => a - b);
    
    const successRate = results.filter(r => r >= initialBalance).length / iterations * 100;
    const avgFinalBalance = results.reduce((a, b) => a + b, 0) / iterations;
    const worstCase = results[0];
    const bestCase = results[results.length - 1];
    const lowerBound = results[Math.floor(iterations * 0.05)];
    const upperBound = results[Math.floor(iterations * 0.95)];

    setMonteCarloResults({
      iterations,
      successRate,
      avgFinalBalance,
      worstCase,
      bestCase,
      confidenceInterval: { lower: lowerBound, upper: upperBound },
    });

    setIsRunning(false);
  };

  const metrics = calculateRiskMetrics();
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
        Risk Analysis Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Risk Metrics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SecurityIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>Risk Metrics</Typography>
            </Box>

            {!metrics ? (
              <Typography color="text.secondary">Unable to calculate metrics.</Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Alert 
                    severity={metrics.riskOfRuin < 20 ? 'success' : metrics.riskOfRuin < 50 ? 'warning' : 'error'}
                    icon={<WarningIcon />}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Risk of Ruin: {metrics.riskOfRuin.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption">
                      {metrics.riskOfRuin < 20 ? 'Low risk - Strategy appears sustainable' : 
                       metrics.riskOfRuin < 50 ? 'Moderate risk - Consider reducing position size' : 
                       'High risk - Strategy may lead to account blowup'}
                    </Typography>
                  </Alert>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Expected Value/Trade</Typography>
                      <Typography variant="h5" fontWeight={700} color={metrics.expectedValue >= 0 ? 'success.main' : 'error.main'}>
                        ${metrics.expectedValue.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Kelly Criterion</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {metrics.kellyCriterion.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Optimal position size
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">VaR (95%)</Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        ${metrics.var95.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max loss in 95% cases
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">VaR (99%)</Typography>
                      <Typography variant="h6" fontWeight={600} color="error.main">
                        ${metrics.var99.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max loss in 99% cases
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Avg Consecutive Wins</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {metrics.avgConsecutiveWins.toFixed(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Avg Consecutive Losses</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {metrics.avgConsecutiveLosses.toFixed(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Max Consecutive Wins</Typography>
                      <Typography variant="h5" fontWeight={700} color="success.main">
                        {metrics.maxConsecutiveWins}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Max Consecutive Losses</Typography>
                      <Typography variant="h5" fontWeight={700} color="error.main">
                        {metrics.maxConsecutiveLosses}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Monte Carlo Simulation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AssessmentIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>Monte Carlo Simulation</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Simulates 1000 iterations of trading based on historical performance to estimate probability of success.
            </Typography>

            <Box display="flex" gap={2} mb={3}>
              <button
                onClick={runMonteCarloSimulation}
                disabled={isRunning}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {isRunning ? 'Running...' : 'Run Simulation (1000 iterations)'}
              </button>
            </Box>

            {isRunning && <LinearProgress sx={{ mb: 2 }} />}

            {monteCarloResults && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Alert severity={monteCarloResults.successRate >= 70 ? 'success' : monteCarloResults.successRate >= 50 ? 'warning' : 'error'}>
                    <Typography variant="body2" fontWeight={600}>
                      Success Rate: {monteCarloResults.successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption">
                      Probability of ending with profit after {monteCarloResults.iterations} simulations
                    </Typography>
                  </Alert>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Average Final Balance</Typography>
                      <Typography variant="h5" fontWeight={700}>
                        ${monteCarloResults.avgFinalBalance.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">95% Confidence Interval</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ${monteCarloResults.confidenceInterval.lower.toFixed(2)} - ${monteCarloResults.confidenceInterval.upper.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Best Case</Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        ${monteCarloResults.bestCase.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Worst Case</Typography>
                      <Typography variant="h6" fontWeight={600} color="error.main">
                        ${monteCarloResults.worstCase.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Note: Monte Carlo simulation uses random sampling based on historical statistics. Past performance does not guarantee future results.
                  </Typography>
                </Grid>
              </Grid>
            )}

            {!monteCarloResults && !isRunning && (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                py={5}
                color="text.secondary"
              >
                <TrendingUpIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography>Click "Run Simulation" to start Monte Carlo analysis</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskAnalyzer;
