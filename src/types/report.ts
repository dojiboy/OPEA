export interface BacktestReport {
  id: string;
  name: string;
  uploadDate: Date;
  general: {
    broker: string;
    symbol: string;
    period: string;
    dateFrom: Date;
    dateTo: Date;
    initialDeposit: number;
    leverage: string;
  };
  summary: {
    totalNetProfit: number;
    grossProfit: number;
    grossLoss: number;
    profitFactor: number;
    recoveryFactor: number;
    sharpeRatio: number;
    zScore: number;
    onTesterResult: number;
  };
  trades: Trade[];
  drawdown: {
    absolute: number;
    relative: number;
    relativePercent: number;
    equityDD: number;
    balanceDD: number;
  };
  graphData?: {
    time: number;
    balance: number;
    equity: number;
  }[];
}

export interface GraphPoint {
  time: number;
  balance: number;
  equity: number;
}
