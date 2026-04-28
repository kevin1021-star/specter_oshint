import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import TargetMonitor from './components/TargetMonitor';
import SearchConsole from './components/SearchConsole';
import Nexus3D from './components/Nexus3D';

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
    <div className="water-bg aurora-bg" style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', perspective: '2000px' }}>
      <div className="cyber-grid circuit-bg" />
      <div className="tech-grid-overlay" />
      <div className="scanline" />

      {/* Data Streams */}
      <div className="data-column" style={{ left: '10%', animationDelay: '0s' }} />
      <div className="data-column" style={{ left: '90%', animationDelay: '0.5s' }} />

      {/* HUD Rings Background */}
      <div className="hud-ring" style={{ width: 1000, height: 1000, top: '50%', left: '50%', marginLeft: -500, marginTop: -500, opacity: 0.03 }} />
      <div className="hud-ring" style={{ width: 600, height: 600, top: '50%', left: '50%', marginLeft: -300, marginTop: -300, opacity: 0.05, animationDirection: 'reverse' }} />

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

      {/* 3D Background Elements */}
      <Nexus3D />

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -100, rotateY: 45, translateZ: -200 }}
        animate={{ x: 0, rotateY: 0, translateZ: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel tech-border projection-surface"
        style={{
          width: 76, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '24px 0', margin: 10, zIndex: 10, gap: 12,
          transformStyle: 'preserve-3d', position: 'relative',
          background: 'rgba(2, 8, 20, 0.9)'
        }}
      >
        <div className="tech-corner corner-tl" />
        <div className="tech-corner corner-tr" />
        <div className="tech-corner corner-bl" />
        <div className="tech-corner corner-br" />

        {/* Logo */}
        <motion.div
          whileHover={{ rotateY: 360, scale: 1.2, translateZ: 50 }}
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 30, border: '1px solid var(--accent-cyan)',
            cursor: 'default',
            boxShadow: '0 0 30px rgba(0,242,255,0.3)',
            transformStyle: 'preserve-3d'
          }}
        >
          🛰️
        </motion.div>

        {/* Nav Items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.15, translateZ: 30, x: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{
                width: 46, height: 46, borderRadius: 12,
                border: activeTab === tab.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(0,242,255,0.1)',
                background: activeTab === tab.id ? 'rgba(0,242,255,0.2)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-dim)',
                fontSize: 20, cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: activeTab === tab.id ? '0 0 20px rgba(0,242,255,0.3)' : 'none',
                transformStyle: 'preserve-3d'
              }}
            >
              {tab.icon}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, perspective: '1500px' }}>
        {/* Top Bar */}
        <motion.header
          initial={{ y: -100, rotateX: -45 }}
          animate={{ y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="glass-panel tech-border"
          style={{
            margin: '10px 10px 0 0', padding: '14px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', background: 'rgba(2, 8, 20, 0.9)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="tech-corner corner-tl" style={{ width: 12, height: 12 }} />
          <div className="tech-corner corner-tr" style={{ width: 12, height: 12 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, transform: 'translateZ(20px)' }}>
            <div className="hud-gauge" style={{ width: 28, height: 28 }} />
            <h1 className="font-orbitron glow-text scanning-text floating-3d-text" style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent-cyan)', letterSpacing: 4 }}>
              SPECTER_OSINT_NODE
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, transform: 'translateZ(20px)' }}>
            <div className="status-dot" style={{ animation: 'circle-pulse 2s infinite' }} />
            <span className="font-orbitron text-dim" style={{ fontSize: 10, letterSpacing: 3 }}>
              UPLINK_ESTABLISHED // AGENT_{agentId}
            </span>
          </div>
        </motion.header>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '10px 10px 10px 0', transformStyle: 'preserve-3d' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, translateZ: -200, rotateX: 20 }}
              animate={{ opacity: 1, translateZ: 0, rotateX: 0 }}
              exit={{ opacity: 0, translateZ: 200, rotateX: -20 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              style={{ height: '100%', transformStyle: 'preserve-3d' }}
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
