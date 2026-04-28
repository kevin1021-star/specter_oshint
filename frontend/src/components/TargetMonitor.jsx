import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TargetMonitor = ({ agentId }) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingTarget, setAddingTarget] = useState(false);
  const [newHandle, setNewHandle] = useState('');

  const fetchTargets = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const url = `http://localhost:8080/targets${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url, { headers: { 'X-Agent-ID': agentId } });
      const data = await res.json();
      setTargets(data);
    } catch (err) {
      console.error('Fetch targets failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTargets(); }, []);

  const handleAdd = async () => {
    if (!newHandle.trim()) return;
    setAddingTarget(true);
    try {
      const res = await fetch('http://localhost:8080/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-ID': agentId },
        body: JSON.stringify({ username: newHandle.trim() })
      });
      if (res.ok) {
        setNewHandle('');
        fetchTargets();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to add target');
      }
    } catch { alert('Backend connection error'); }
    finally { setAddingTarget(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this target?')) return;
    try {
      await fetch(`http://localhost:8080/targets/${id}`, {
        method: 'DELETE', headers: { 'X-Agent-ID': agentId }
      });
      fetchTargets();
    } catch { alert('Delete failed'); }
  };

  // Mini sparkline component
  const Sparkline = ({ data }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120, h = 32;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
      <svg width={w} height={h} style={{ opacity: 0.6 }}>
        <polyline points={points} fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" />
        <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r="3" fill="var(--accent-cyan)">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  };

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, padding: 4 }}>
      {/* Main Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-orbitron text-water" style={{ fontSize: 13, letterSpacing: 4 }}>
            ◉ ACTIVE WATCHLIST
          </h2>
          <button
            onClick={() => fetchTargets(true)}
            className="btn-water"
            disabled={refreshing}
            style={{ padding: '8px 16px', fontSize: 9 }}
          >
            {refreshing ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>⟳</motion.span>
            ) : '⟳ REFRESH ALL'}
          </button>
        </div>

        {/* Target List */}
        <div className="glass-panel" style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {loading && targets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 32, display: 'inline-block' }}>🌊</motion.div>
              <p className="text-dim" style={{ marginTop: 12, fontSize: 11, letterSpacing: 3 }}>SCANNING TARGETS...</p>
            </div>
          )}

          {!loading && targets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p className="text-dim" style={{ fontSize: 12, letterSpacing: 2 }}>NO TARGETS TRACKED YET</p>
              <p className="text-dim" style={{ fontSize: 10, marginTop: 8 }}>Add a target from the right panel →</p>
            </div>
          )}

          <AnimatePresence>
            {targets.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel card-hover"
                style={{
                  padding: '16px 20px',
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(0,20,50,0.4)',
                  cursor: 'default',
                }}
              >
                {/* Left: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="anim-depth-pulse" style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,47,255,0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, border: '1px solid rgba(0,212,255,0.2)',
                  }}>
                    👁
                  </div>
                  <div>
                    <div className="font-orbitron" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      @{t.username}
                    </div>
                    <div className="text-dim" style={{ fontSize: 10, marginTop: 2 }}>
                      {t.followers.toLocaleString()} followers • {t.following.toLocaleString()} following
                      {t.is_private && <span style={{ color: '#ff6b8a', marginLeft: 8 }}>🔒 PRIVATE</span>}
                    </div>
                  </div>
                </div>

                {/* Middle: Sparkline */}
                <Sparkline data={t.sparkline} />

                {/* Right: Delta + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00ff88', fontWeight: 700, fontSize: 16 }}>
                      +{t.added}
                    </div>
                    <div className="text-dim" style={{ fontSize: 8, letterSpacing: 2 }}>NEW</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#ff4466', fontWeight: 700, fontSize: 16 }}>
                      -{t.removed}
                    </div>
                    <div className="text-dim" style={{ fontSize: 8, letterSpacing: 2 }}>LOST</div>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)',
                      borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                      color: '#ff6b8a', fontSize: 10, fontFamily: 'Orbitron',
                      transition: 'all 0.3s',
                    }}
                    onMouseOver={e => e.target.style.background = 'rgba(255,45,85,0.25)'}
                    onMouseOut={e => e.target.style.background = 'rgba(255,45,85,0.1)'}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Add Target */}
        <div className="glass-panel anim-fade-in-right" style={{ padding: 24 }}>
          <h3 className="font-orbitron text-water" style={{ fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>
            + ADD TARGET
          </h3>
          <input
            className="water-input"
            placeholder="username"
            value={newHandle}
            onChange={e => setNewHandle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ marginBottom: 12, fontSize: 13 }}
          />
          <button onClick={handleAdd} className="btn-water" disabled={addingTarget} style={{ width: '100%', padding: 12, fontSize: 10 }}>
            {addingTarget ? 'SCANNING...' : '⊕ TRACK TARGET'}
          </button>
        </div>

        {/* Stats */}
        <div className="glass-panel anim-fade-in-right" style={{ padding: 24, animationDelay: '0.15s' }}>
          <h3 className="font-orbitron" style={{ fontSize: 11, letterSpacing: 3, marginBottom: 16, color: 'var(--accent-purple)' }}>
            SYSTEM STATUS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StatRow label="Active Targets" value={targets.length} color="var(--accent-cyan)" />
            <StatRow label="Engine" value="Stealth v5" color="#00ff88" />
            <StatRow label="Browser Link" value="Playwright" color="var(--accent-cyan)" />
            <StatRow label="Detection Risk" value="Minimal" color="#00ff88" />
          </div>
        </div>

        {/* Activity */}
        <div className="glass-panel anim-fade-in-right" style={{ padding: 24, flex: 1, overflow: 'hidden', animationDelay: '0.3s' }}>
          <h3 className="font-orbitron text-dim" style={{ fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>
            ACTIVITY LOG
          </h3>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            {targets.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 20 }}>No activity yet.</p>
            ) : (
              targets.slice(0, 5).map((t, i) => (
                <div key={i} style={{
                  padding: '8px 10px', marginBottom: 6,
                  background: 'rgba(0,20,50,0.3)', borderRadius: 6,
                  borderLeft: '2px solid var(--accent-cyan)',
                }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>@{t.username}</span>
                  <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                    {t.followers.toLocaleString()} followers tracked
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
    <span className="text-dim" style={{ fontSize: 10 }}>{label}</span>
    <span style={{ color, fontWeight: 700, fontSize: 12, fontFamily: 'Orbitron' }}>{value}</span>
  </div>
);

export default TargetMonitor;
