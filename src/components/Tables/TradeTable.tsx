import React, { useState, useMemo } from 'react';
import { 
  DataGrid, GridColDef, GridSortModel, GridFilterModel, GridToolbar 
} from '@mui/x-data-grid';
import { Box, Paper, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Trade } from '../../types/trade';

interface TradeTableProps {
  trades: Trade[];
  onRowClick?: (trade: Trade) => void;
  height?: number;
}

const TradeTable: React.FC<TradeTableProps> = ({ 
  trades, 
  onRowClick,
  height = 500 
}) => {
  const [searchText, setSearchText] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'time', sort: 'desc' }
  ]);

  const columns: GridColDef[] = [
    { 
      field: 'time', 
      headerName: 'Time', 
      width: 160,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleString();
      }
    },
    { field: 'ticket', headerName: 'Ticket', width: 80 },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 80,
      cellClassName: (params) => {
        if (params.value === 'BUY') return 'trade-buy';
        if (params.value === 'SELL') return 'trade-sell';
        return '';
      }
    },
    { field: 'volume', headerName: 'Volume', width: 80, align: 'right', headerAlign: 'right' },
    { field: 'openPrice', headerName: 'Open Price', width: 100, align: 'right', headerAlign: 'right' },
    { field: 'closePrice', headerName: 'Close Price', width: 100, align: 'right', headerAlign: 'right' },
    { 
      field: 'profit', 
      headerName: 'Profit', 
      width: 100, 
      align: 'right', 
      headerAlign: 'right',
      cellClassName: (params) => {
        if (params.value > 0) return 'profit-positive';
        if (params.value < 0) return 'profit-negative';
        return '';
      }
    },
    { field: 'swap', headerName: 'Swap', width: 80, align: 'right', headerAlign: 'right' },
    { field: 'commission', headerName: 'Commission', width: 100, align: 'right', headerAlign: 'right' },
    { field: 'comment', headerName: 'Comment', width: 150 },
    { field: 'strategyId', headerName: 'Strategy', width: 100 },
    { 
      field: 'duration', 
      headerName: 'Duration', 
      width: 100,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const minutes = Math.floor(params.value / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
      }
    },
  ];

  const filteredTrades = useMemo(() => {
    if (!searchText.trim()) return trades;
    
    const search = searchText.toLowerCase();
    return trades.filter(trade => 
      trade.ticket?.toLowerCase().includes(search) ||
      trade.comment?.toLowerCase().includes(search) ||
      trade.type?.toLowerCase().includes(search) ||
      trade.strategyId?.toLowerCase().includes(search)
    );
  }, [trades, searchText]);

  const rows = useMemo(() => {
    return filteredTrades.map((trade, index) => ({
      id: trade.ticket || index,
      ...trade,
    }));
  }, [filteredTrades]);

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Trades ({filteredTrades.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search by ticket, comment, type..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1, '& .profit-positive': { color: '#10b981', fontWeight: 600 }, '& .profit-negative': { color: '#ef4444', fontWeight: 600 }, '& .trade-buy': { color: '#2563eb', fontWeight: 600 }, '& .trade-sell': { color: '#f59e0b', fontWeight: 600 } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowClick={onRowClick ? (params) => onRowClick(params.row as Trade) : undefined}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
              print: false,
            },
          }}
          autoHeight={false}
          sx={{ 
            border: 'none',
            '& .MuiDataGrid-main': { maxHeight: height - 120 },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(224, 224, 224, 1)' }
          }}
        />
      </Box>
    </Paper>
  );
};

export default TradeTable;
