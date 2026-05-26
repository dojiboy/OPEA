import React, { useState } from 'react';

interface Trade {
  ticket: number;
  time: number;
  type: string;
  volume: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  comment?: string;
  strategyId?: string;
}

interface TradeTableProps {
  trades: Trade[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Trade>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const filteredTrades = trades.filter(trade =>
    trade.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.ticket.toString().includes(searchTerm) ||
    trade.strategyId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTrades.length / rowsPerPage);
  const paginatedTrades = sortedTrades.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trade History</h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Ticket', 'Time', 'Type', 'Volume', 'Open', 'Close', 'Profit', 'Comment'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort(header.toLowerCase() as keyof Trade)}>
                  {header} {sortField === header.toLowerCase() && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedTrades.map((trade) => (
              <tr key={trade.ticket} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{trade.ticket}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{new Date(trade.time).toLocaleString()}</td>
                <td className={`px-4 py-2 text-sm font-medium ${trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>{trade.type}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{trade.volume}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{trade.openPrice.toFixed(5)}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{trade.closePrice.toFixed(5)}</td>
                <td className={`px-4 py-2 text-sm font-medium ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${trade.profit.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{trade.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Prev</button>
          <span className="text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default TradeTable;
