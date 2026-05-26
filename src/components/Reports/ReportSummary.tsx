import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
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
      icon: <TrendingUpIcon />,
      color: summary.totalNetProfit >= 0 ? 'success' : 'error',
    },
    {
      title: 'Profit Factor',
      value: summary.profitFactor.toFixed(2),
      icon: <AssessmentIcon />,
      color: summary.profitFactor >= 1.5 ? 'success' : summary.profitFactor >= 1 ? 'warning' : 'error',
    },
    {
      title: 'Total Trades',
      value: trades.total.toString(),
      icon: <PeopleIcon />,
      color: 'info',
    },
    {
      title: 'Win Rate',
      value: `${trades.winRate.toFixed(1)}%`,
      icon: <AssessmentIcon />,
      color: trades.winRate >= 50 ? 'success' : trades.winRate >= 40 ? 'warning' : 'error',
    },
    {
      title: 'Max Drawdown',
      value: `${drawdown.relativePercent.toFixed(2)}%`,
      icon: <WarningIcon />,
      color: drawdown.relativePercent < 20 ? 'success' : drawdown.relativePercent < 40 ? 'warning' : 'error',
    },
    {
      title: 'Recovery Factor',
      value: summary.recoveryFactor.toFixed(2),
      icon: <TrendingUpIcon />,
      color: summary.recoveryFactor >= 3 ? 'success' : summary.recoveryFactor >= 1 ? 'warning' : 'error',
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              borderLeft: `4px solid`,
              borderColor: stat.color === 'success' ? 'success.main' : stat.color === 'error' ? 'error.main' : stat.color === 'warning' ? 'warning.main' : 'info.main',
            }}
          >
            <Box display="flex" justifyContent="center" mb={1} color={`${stat.color}.main`}>
              {stat.icon}
            </Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {stat.title}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stat.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportSummary;
