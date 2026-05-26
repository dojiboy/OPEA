import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BacktestReport } from '../types/report';
import { Trade } from '../types/trade';

interface ReportState {
  reports: BacktestReport[];
  addReport: (report: BacktestReport) => void;
  removeReport: (id: string) => void;
  clearReports: () => void;
  getAllTrades: () => Trade[];
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      
      addReport: (report) => set((state) => ({ 
        reports: [...state.reports, report] 
      })),
      
      removeReport: (id) => set((state) => ({ 
        reports: state.reports.filter(r => r.id !== id) 
      })),
      
      clearReports: () => set({ reports: [] }),
      
      getAllTrades: () => {
        const state = get();
        return state.reports.flatMap(report => report.trades || []);
      },
    }),
    {
      name: 'ea-reports-storage',
    }
  )
);
