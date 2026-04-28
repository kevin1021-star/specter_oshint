import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScannerConsole = () => {
  const [target, setTarget] = useState('');
  const [activeScanId, setActiveScanId] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    let interval;
    if (activeScanId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8080/scan/${activeScanId}`);
          const data = await res.json();
          setScanData(data);
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            clearInterval(interval);
            setLoading(false);
          }
        } catch (e) {
          console.error("Poll error", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeScanId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanData?.results?.logs]);

  const startScan = async () => {
    if (!target) return;
    setLoading(true);
    setScanData(null);
    try {
      const res = await fetch('http://localhost:8080/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await res.json();
      setActiveScanId(data.scan_id);
    } catch (e) {
      alert("Backend error");
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, padding: 10 }}>
      {/* Main Command Center */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        
        {/* Input Bar */}
        <div className="glass-panel tech-border projection-surface" style={{ padding: '24px', position: 'relative' }}>
          <div className="tech-corner corner-tl" />
          <div className="tech-corner corner-br" />
          <h2 className="font-orbitron scanning-text" style={{ fontSize: 14, letterSpacing: 4, color: 'var(--accent-cyan)', marginBottom: 20 }}>
            ONYX_COMMAND_INJECTOR
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="water-input"
              placeholder="ENTER TARGET DOMAIN (e.g. example.com)..."
              value={target}
              onChange={e => setTarget(e.target.value)}
              style={{ flex: 1, fontFamily: 'monospace', letterSpacing: 1 }}
            />
            <button onClick={startScan} className="btn-water" disabled={loading} style={{ padding: '0 30px' }}>
              {loading ? '⟳ INITIALIZING...' : '⚡ START_SCAN'}
            </button>
          </div>
        </div>

        {/* Console Output */}
        <div className="glass-panel tech-border" style={{ flex: 1, padding: '20px', background: 'rgba(0,5,15,0.9)', overflowY: 'auto', position: 'relative' }}>
          <div className="tech-grid-overlay" style={{ opacity: 0.1 }} />
          <div className="font-orbitron" style={{ fontSize: 11, color: 'var(--accent-cyan)', marginBottom: 12, opacity: 0.7 }}>
            SYSTEM_LOGS // RECON_ACTIVE
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>
            {scanData?.results?.logs?.map((log, i) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: 'var(--accent-green)' }}>[SYSTEM]</span> {log}
              </motion.div>
            ))}
            {!scanData?.results?.logs && <div className="text-dim">Waiting for target injection...</div>}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Subdomains */}
        <div className="glass-panel tech-border" style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <h3 className="font-orbitron" style={{ fontSize: 11, letterSpacing: 3, marginBottom: 16, color: 'var(--accent-purple)' }}>
            SUBDOMAIN_INVENTORY
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scanData?.results?.subdomains?.map((s, i) => (
              <div key={i} style={{ fontSize: 10, padding: '6px 10px', background: 'rgba(0,242,255,0.05)', borderLeft: '2px solid var(--accent-cyan)', fontFamily: 'monospace' }}>
                {s}
              </div>
            )) || <div className="text-dim">No data.</div>}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="glass-panel tech-border" style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <h3 className="font-orbitron" style={{ fontSize: 11, letterSpacing: 3, marginBottom: 16, color: '#ff4466' }}>
            VULNERABILITY_MATRIX
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scanData?.results?.vulnerabilities?.map((v, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{ padding: 12, background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)', borderRadius: 8 }}
              >
                <div style={{ fontWeight: 800, fontSize: 10, color: '#ff4466' }}>[{v.severity}] {v.type}</div>
              </motion.div>
            )) || <div className="text-dim">Scanning...</div>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScannerConsole;
