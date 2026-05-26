import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BacktestReport } from '../../types/report';

interface StrategyPerformanceBreakdownProps {
  trades: any[];
}

interface StrategyStats {
  strategyId: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
}

const StrategyPerformanceBreakdown: React.FC<StrategyPerformanceBreakdownProps> = ({ trades }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const strategyStats = React.useMemo(() => {
    const statsMap = new Map<string, StrategyStats>();

    trades.forEach(trade => {
      const strategyId = trade.strategyId || 'Unknown';
      
      if (!statsMap.has(strategyId)) {
        statsMap.set(strategyId, {
          strategyId,
          totalTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalProfit: 0,
          avgProfit: 0,
          largestWin: 0,
          largestLoss: 0,
          profitFactor: 0,
        });
      }

      const stats = statsMap.get(strategyId)!;
      stats.totalTrades++;
      stats.totalProfit += trade.profit || 0;

      if (trade.profit > 0) {
        stats.wins++;
        if (trade.profit > stats.largestWin) {
          stats.largestWin = trade.profit;
        }
      } else if (trade.profit < 0) {
        stats.losses++;
        if (trade.profit < stats.largestLoss) {
          stats.largestLoss = trade.profit;
        }
      }
    });

    // Calculate derived stats
    statsMap.forEach(stats => {
      stats.winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0;
      stats.avgProfit = stats.totalTrades > 0 ? stats.totalProfit / stats.totalTrades : 0;
      
      const grossProfit = trades
        .filter(t => t.strategyId === stats.strategyId && t.profit > 0)
        .reduce((sum, t) => sum + t.profit, 0);
      const grossLoss = Math.abs(trades
        .filter(t => t.strategyId === stats.strategyId && t.profit < 0)
        .reduce((sum, t) => sum + t.profit, 0));
      
      stats.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999.99 : 0;
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [trades]);

  const bestStrategy = strategyStats.length > 0 ? strategyStats[0] : null;
  const worstStrategy = strategyStats.length > 0 ? strategyStats[strategyStats.length - 1] : null;

  if (trades.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">No trade data available for strategy breakdown.</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Strategy Performance Breakdown
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon />
                <Typography variant="subtitle2" fontWeight={600}>Best Strategy</Typography>
              </Box>
              {bestStrategy && (
                <>
                  <Typography variant="h5" fontWeight={700}>{bestStrategy.strategyId}</Typography>
                  <Typography variant="body2">
                    Profit: ${bestStrategy.totalProfit.toFixed(2)} | Win Rate: {bestStrategy.winRate.toFixed(1)}%
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingDownIcon />
                <Typography variant="subtitle2" fontWeight={600}>Worst Strategy</Typography>
              </Box>
              {worstStrategy && (
                <>
                  <Typography variant="h5" fontWeight={700}>{worstStrategy.strategyId}</Typography>
                  <Typography variant="body2">
                    Profit: ${worstStrategy.totalProfit.toFixed(2)} | Win Rate: {worstStrategy.winRate.toFixed(1)}%
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Strategy List */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {strategyStats.map((stats) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={stats.strategyId}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedStrategy === stats.strategyId ? 2 : 1,
                  borderColor: selectedStrategy === stats.strategyId ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                }}
                onClick={() => setSelectedStrategy(selectedStrategy === stats.strategyId ? null : stats.strategyId)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{stats.strategyId}</Typography>
                    <Chip 
                      label={`${stats.totalTrades} trades`}
                      size="small"
                      color={stats.totalProfit >= 0 ? 'success' : 'error'}
                    />
                  </Box>
                  
                  <Grid container spacing={1} fontSize="0.875rem">
                    <Grid size={6}>
                      <Typography color="text.secondary">Win Rate:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600} color={stats.winRate >= 50 ? 'success.main' : 'warning.main'}>
                        {stats.winRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    
                    <Grid size={6}>
                      <Typography color="text.secondary">Profit:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600} color={stats.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                        ${stats.totalProfit.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid size={6}>
                      <Typography color="text.secondary">Avg Trade:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600}>
                        ${stats.avgProfit.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid size={6}>
                      <Typography color="text.secondary">Profit Factor:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600} color={stats.profitFactor >= 1.5 ? 'success.main' : stats.profitFactor >= 1 ? 'warning.main' : 'error.main'}>
                        {stats.profitFactor.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid size={6}>
                      <Typography color="text.secondary">Largest Win:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600} color="success.main">
                        ${stats.largestWin.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid size={6}>
                      <Typography color="text.secondary">Largest Loss:</Typography>
                    </Grid>
                    <Grid size={6} textAlign="right">
                      <Typography fontWeight={600} color="error.main">
                        ${stats.largestLoss.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default StrategyPerformanceBreakdown;
