import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import TargetMonitor from './components/TargetMonitor';
import SearchConsole from './components/SearchConsole';

const tabs = [
  { id: 'monitor', label: 'MONITOR', icon: '◉' },
  { id: 'search', label: 'OSINT', icon: '◎' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('specter_agent_id');
    if (stored) {
      fetch('http://localhost:8080/auth/status', { headers: { 'X-Agent-ID': stored } })
        .then(res => { if (res.ok) setAgentId(stored); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (id) => {
    localStorage.setItem('specter_agent_id', id);
    setAgentId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('specter_agent_id');
    setAgentId(null);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="water-bg" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
          style={{ fontSize: 48, marginBottom: 20 }}
        >
          🌊
        </motion.div>
        <div className="anim-shimmer" style={{ width: 200, height: 3, borderRadius: 2, marginBottom: 16 }} />
        <p className="font-orbitron text-dim" style={{ fontSize: 10, letterSpacing: 4 }}>ESTABLISHING CONNECTION...</p>
      </div>
    );
  }

  // Login
  if (!agentId) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Main Dashboard
  return (
    <div className="water-bg" style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
      <div className="scanline" />

      {/* Ambient bubbles */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bubble" style={{
          width: `${6 + Math.random() * 14}px`,
          height: `${6 + Math.random() * 14}px`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${8 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 6}s`,
        }} />
      ))}

      {/* Waves */}
      <div className="wave-container">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel"
        style={{
          width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 0', margin: 8, zIndex: 10, gap: 8,
        }}
      >
        {/* Logo */}
        <motion.div
          className="anim-depth-pulse"
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, marginBottom: 24, border: '1px solid rgba(0,212,255,0.2)',
            cursor: 'default',
          }}
        >
          🌊
        </motion.div>

        {/* Nav Items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: activeTab === tab.id ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                background: activeTab === tab.id ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-dim)',
                fontSize: 18, cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: activeTab === tab.id ? '0 0 15px rgba(0,212,255,0.2)' : 'none',
              }}
            >
              {tab.icon}
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.1, color: '#ff4466' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          title="Logout"
          style={{
            width: 44, height: 44, borderRadius: 12,
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--text-dim)',
            fontSize: 16, cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⏻
        </motion.button>
      </motion.nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>
        {/* Top Bar */}
        <motion.header
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel"
          style={{
            margin: '8px 8px 0 0', padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="font-orbitron glow-text" style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: 2 }}>
              SPECTER
            </h1>
            <span className="text-dim" style={{ fontSize: 10, letterSpacing: 2 }}>v5.0 STEALTH</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="status-dot" />
            <span className="font-orbitron text-dim" style={{ fontSize: 9, letterSpacing: 2 }}>
              AGENT_{agentId} CONNECTED
            </span>
          </div>
        </motion.header>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '8px 8px 8px 0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              {activeTab === 'monitor' && <TargetMonitor agentId={agentId} />}
              {activeTab === 'search' && <SearchConsole agentId={agentId} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
