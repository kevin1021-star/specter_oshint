import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchConsole = ({ agentId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`http://localhost:8080/resolve?pattern=${encodeURIComponent(query.trim())}`, {
        headers: { 'X-Agent-ID': agentId }
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (username) => {
    try {
      const res = await fetch('http://localhost:8080/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Agent-ID': agentId },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        alert(`✓ @${username} added to watchlist`);
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to track');
      }
    } catch { alert('Backend error'); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ padding: '20px 24px' }}
      >
        <h2 className="font-orbitron text-water" style={{ fontSize: 13, letterSpacing: 4, marginBottom: 16 }}>
          ◎ OSINT RESOLVE ENGINE
        </h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="water-input"
            placeholder="Enter username or pattern (e.g. shubham_s21)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button onClick={handleSearch} className="btn-water" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? '⟳ SCANNING...' : '⊛ RESOLVE'}
          </button>
        </div>
        <p className="text-dim" style={{ fontSize: 10, marginTop: 10, letterSpacing: 1 }}>
          The Stealth Browser will verify each candidate profile on Instagram in real-time.
        </p>
      </motion.div>

      {/* Results */}
      <div className="glass-panel" style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {!searched && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 48, marginBottom: 16 }}
            >
              🔍
            </motion.div>
            <p className="font-orbitron text-dim" style={{ fontSize: 11, letterSpacing: 3 }}>
              AWAITING SEARCH QUERY
            </p>
            <p className="text-dim" style={{ fontSize: 10, marginTop: 8 }}>
              Enter a username to find matching Instagram profiles
            </p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 40, display: 'inline-block' }}
            >
              🌊
            </motion.div>
            <p className="font-orbitron text-water" style={{ fontSize: 11, marginTop: 16, letterSpacing: 3 }}>
              STEALTH BROWSER SCANNING...
            </p>
            <p className="text-dim" style={{ fontSize: 10, marginTop: 8 }}>
              Verifying profiles through your authenticated session
            </p>
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="text-dim" style={{ fontSize: 12 }}>No matching profiles found.</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && results.map((r, i) => (
            <motion.div
              key={r.username}
              initial={{ opacity: 0, y: 20, rotateX: 10, translateZ: -50 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ 
                translateZ: 30, 
                rotateX: -5,
                boxShadow: '0 20px 40px rgba(0,242,255,0.1)'
              }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              className="glass-panel hologram-effect tech-border"
              style={{
                padding: '18px 22px', marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(0,20,50,0.5)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, transform: 'translateZ(20px)' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: r.confidence > 80
                    ? 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,242,255,0.15))'
                    : 'linear-gradient(135deg, rgba(255,150,0,0.15), rgba(255,45,85,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${r.confidence > 80 ? 'rgba(0,255,136,0.3)' : 'rgba(255,150,0,0.3)'}`,
                  boxShadow: `0 0 15px ${r.confidence > 80 ? 'rgba(0,255,136,0.1)' : 'rgba(255,150,0,0.1)'}`,
                  fontSize: 18,
                }}>
                  {r.confidence > 80 ? '✓' : '?'}
                </div>
                <div>
                  <div className="font-orbitron" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    @{r.username}
                  </div>
                  <div className="text-dim" style={{ fontSize: 10, marginTop: 2 }}>
                    {r.followers > 0 ? `${r.followers.toLocaleString()} followers` : 'Unverified'}
                    {r.is_private && <span style={{ color: '#ff6b8a', marginLeft: 8 }}>🔒 Private</span>}
                    <span style={{ marginLeft: 8, color: r.confidence > 80 ? '#00ff88' : '#ffaa00' }}>
                      {r.confidence}% match
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTrack(r.username)}
                className="btn-water"
                style={{ padding: '8px 16px', fontSize: 9 }}
              >
                + TRACK
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchConsole;
