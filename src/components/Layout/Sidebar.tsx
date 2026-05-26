import React from 'react';
import { useUIStore } from '../../store';

type View = 'upload' | 'reports' | 'analysis' | 'comparison' | 'settings';

interface NavItem {
  id: View;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'upload', label: 'Upload Files', icon: '📁' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'analysis', label: 'Analysis', icon: '🔍' },
  { id: 'comparison', label: 'Comparison', icon: '⚖️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, currentView, setCurrentView } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              ...styles.navItem,
              ...(currentView === item.id ? styles.navItemActive : {}),
            }}
            aria-current={currentView === item.id ? 'page' : undefined}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={styles.footer}>
        <p style={styles.version}>v1.0.0</p>
        <p style={styles.shortcut}>Ctrl+O to upload</p>
      </div>
    </aside>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '250px',
    background: 'var(--bg-primary)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: '65px',
    bottom: 0,
    overflowY: 'auto',
    zIndex: 90,
  },
  nav: {
    padding: '16px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    marginBottom: '4px',
  },
  navItemActive: {
    background: 'var(--primary)',
    color: 'white',
  },
  navIcon: {
    fontSize: '18px',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  version: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '0 0 4px 0',
  },
  shortcut: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: 0,
    opacity: 0.7,
  },
};

export default Sidebar;
