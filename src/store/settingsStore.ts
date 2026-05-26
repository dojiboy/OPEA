import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  darkMode: boolean;
  language: 'en' | 'id';
  currency: string;
  timezone: string;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'en' | 'id') => void;
  setCurrency: (currency: string) => void;
  setTimezone: (timezone: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setLanguage: (lang) => set({ language: lang }),
      setCurrency: (currency) => set({ currency }),
      setTimezone: (timezone) => set({ timezone }),
    }),
    {
      name: 'ea-settings-storage',
    }
  )
);
