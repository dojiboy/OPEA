import React from 'react';
import { useUIStore, useSettingsStore } from '../../store';

const Header: React.FC = () => {
  const { darkMode, toggleSidebar, setDarkMode, addToast } = useUIStore();
  const { settings, updateSettings } = useSettingsStore();

  const handleThemeToggle = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    updateSettings({ theme: newTheme });
    addToast({
      type: 'info',
      message: `Switched to ${newTheme} mode`,
    });
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button onClick={toggleSidebar} style={styles.iconBtn} aria-label="Toggle sidebar">
          ☰
        </button>
        <h1 style={styles.title}>EA Backtest Analyzer</h1>
      </div>
      <div style={styles.right}>
        <button 
          onClick={handleThemeToggle} 
          style={styles.themeBtn}
          aria-label="Toggle theme"
          title="Toggle dark/light mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <span style={styles.currency}>{settings.currency}</span>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-primary)',
    padding: '8px',
    borderRadius: '6px',
  },
  themeBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    fontSize: '20px',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  currency: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--primary)',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    borderRadius: '6px',
  },
};

export default Header;
