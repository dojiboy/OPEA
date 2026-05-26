export interface Trade {
  ticket?: string;
  time: number;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  swap: number;
  commission: number;
  comment?: string;
  strategyId?: string;
  duration?: number;
  magic?: number;
}
