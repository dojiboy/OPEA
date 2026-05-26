import Papa from 'papaparse';
import { BacktestReport } from '../../types/report';
import { Trade } from '../../types/trade';

export const parseMT5Report = async (file: File): Promise<BacktestReport> => {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  let content: string;

  if (extension === 'csv') {
    content = await readFileAsText(file);
    return parseCSV(content, file.name);
  } else if (extension === 'htm' || extension === 'html') {
    content = await readFileAsText(file);
    return parseHTML(content, file.name);
  } else if (extension === 'xlsx' || extension === 'xls') {
    // For Excel files, we'll need to handle differently
    return parseExcel(file);
  }

  throw new Error('Unsupported file format');
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const parseCSV = (content: string, fileName: string): BacktestReport => {
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  const rows = parsed.data as any[];

  // Try to detect trade data
  const trades: Trade[] = [];
  const graphData: { time: number; balance: number; equity: number }[] = [];

  rows.forEach((row, index) => {
    // Detect trade rows
    if (row.Time || row['Deal Time'] || row.time) {
      const trade: Trade = {
        ticket: row.Ticket?.toString() || row.ticket?.toString() || `${index}`,
        time: parseDate(row.Time || row['Deal Time'] || row.time),
        type: (row.Type || row.type || row.Action || '').toUpperCase().includes('SELL') ? 'SELL' : 'BUY',
        volume: parseFloat(row.Volume || row.volume || row.Lots || '0'),
        openPrice: parseFloat(row['Open Price'] || row.openPrice || row.Price || '0'),
        closePrice: parseFloat(row['Close Price'] || row.closePrice || row['Price Close'] || '0'),
        profit: parseFloat(row.Profit || row.profit || row['Gross Profit'] || '0'),
        swap: parseFloat(row.Swap || row.swap || '0'),
        commission: parseFloat(row.Commission || row.commission || '0'),
        comment: row.Comment || row.comment || '',
        strategyId: row.Magic?.toString() || row.strategyId?.toString() || '',
      };
      trades.push(trade);
    }

    // Detect balance/equity data
    if (row.Balance !== undefined || row.Equity !== undefined) {
      graphData.push({
        time: parseDate(row.Time || row.Date || ''),
        balance: parseFloat(row.Balance || '0'),
        equity: parseFloat(row.Equity || row.Balance || '0'),
      });
    }
  });

  return createReportFromTrades(trades, graphData, fileName);
};

const parseHTML = (content: string, fileName: string): BacktestReport => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  // Extract summary statistics from HTML report
  const summary: any = {};
  const trades: Trade[] = [];
  const graphData: any[] = [];

  // Parse tables in the HTML
  const tables = doc.querySelectorAll('table');
  
  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th, thead td')).map(th => th.textContent?.trim() || '');
    const rows = table.querySelectorAll('tbody tr, tr');

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) return;

      const rowData: any = {};
      cells.forEach((cell, cellIndex) => {
        const key = headers[cellIndex] || `col${cellIndex}`;
        rowData[key] = cell.textContent?.trim() || '';
      });

      // Check if this is a trade row
      if (rowData.Time || rowData.Deal || rowData.Order) {
        const trade: Trade = {
          ticket: rowData.Ticket?.toString() || rowData.Deal?.toString() || `${rowIndex}`,
          time: parseDate(rowData.Time || rowData.Date || ''),
          type: (rowData.Type || '').toUpperCase().includes('SELL') ? 'SELL' : 'BUY',
          volume: parseFloat(rowData.Volume || rowData.Lots || '0'),
          openPrice: parseFloat(rowData['Open price'] || rowData.Price || '0'),
          closePrice: parseFloat(rowData['Close price'] || '0'),
          profit: parseNumericValue(rowData.Profit || rowData.Gross || '0'),
          swap: parseNumericValue(rowData.Swap || '0'),
          commission: parseNumericValue(rowData.Commission || '0'),
          comment: rowData.Comment || '',
        };
        trades.push(trade);
      }

      // Extract summary stats
      if (headers.some(h => h?.includes('Profit'))) {
        Object.keys(rowData).forEach(key => {
          if (key.includes('Total Net Profit')) summary.totalNetProfit = parseNumericValue(rowData[key]);
          if (key.includes('Gross Profit')) summary.grossProfit = parseNumericValue(rowData[key]);
          if (key.includes('Gross Loss')) summary.grossLoss = Math.abs(parseNumericValue(rowData[key]));
          if (key.includes('Profit Factor')) summary.profitFactor = parseNumericValue(rowData[key]);
          if (key.includes('Recovery Factor')) summary.recoveryFactor = parseNumericValue(rowData[key]);
          if (key.includes('Sharpe Ratio')) summary.sharpeRatio = parseNumericValue(rowData[key]);
          if (key.includes('Drawdown')) summary.maxDrawdown = parseNumericValue(rowData[key]);
        });
      }
    });
  });

  return createReportFromTrades(trades, graphData, fileName, summary);
};

const parseExcel = async (file: File): Promise<BacktestReport> => {
  // Simple Excel parsing - for full implementation would need xlsx library
  const content = await readFileAsText(file);
  return parseCSV(content, file.name);
};

const createReportFromTrades = (
  trades: Trade[], 
  graphData: any[], 
  fileName: string,
  overrideSummary?: any
): BacktestReport => {
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  const totalNetProfit = grossProfit - grossLoss;

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999.99 : 0;
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

  // Calculate max drawdown from trades
  let peak = 0;
  let maxDD = 0;
  let balance = 0;
  
  trades.forEach(trade => {
    balance += trade.profit;
    if (balance > peak) peak = balance;
    const dd = peak - balance;
    if (dd > maxDD) maxDD = dd;
  });

  const relativeDD = peak > 0 ? (maxDD / peak) * 100 : 0;

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: fileName,
    uploadDate: new Date(),
    general: {
      broker: 'Unknown',
      symbol: fileName.split('_')[0] || 'EURUSD',
      period: 'H1',
      dateFrom: trades[0]?.time ? new Date(trades[0].time) : new Date(),
      dateTo: trades[trades.length - 1]?.time ? new Date(trades[trades.length - 1].time) : new Date(),
      initialDeposit: 10000,
      leverage: '1:100',
    },
    summary: {
      totalNetProfit: overrideSummary?.totalNetProfit ?? totalNetProfit,
      grossProfit: overrideSummary?.grossProfit ?? grossProfit,
      grossLoss: overrideSummary?.grossLoss ?? grossLoss,
      profitFactor: overrideSummary?.profitFactor ?? profitFactor,
      recoveryFactor: overrideSummary?.recoveryFactor ?? (totalNetProfit / maxDD || 0),
      sharpeRatio: overrideSummary?.sharpeRatio ?? 0,
      zScore: 0,
      onTesterResult: 0,
    },
    trades,
    drawdown: {
      absolute: maxDD,
      relative: maxDD,
      relativePercent: relativeDD,
      equityDD: maxDD,
      balanceDD: maxDD,
    },
    graphData: graphData.length > 0 ? graphData : generateGraphData(trades),
  };
};

const generateGraphData = (trades: Trade[]): { time: number; balance: number; equity: number }[] => {
  let balance = 10000;
  const graphData: { time: number; balance: number; equity: number }[] = [];

  trades.forEach(trade => {
    balance += trade.profit;
    graphData.push({
      time: trade.time,
      balance,
      equity: balance, // Simplified - in reality equity fluctuates
    });
  });

  return graphData;
};

const parseDate = (dateStr: string): number => {
  if (!dateStr) return Date.now();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return Date.now();
  return date.getTime();
};

const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
