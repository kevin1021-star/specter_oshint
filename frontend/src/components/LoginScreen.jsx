import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const handleRipple = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.width = ripple.style.height = '10px';
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (data.agent_id) {
        onLogin(data.agent_id);
      } else {
        setError('Connection failed. Try again.');
      }
    } catch {
      setError('Backend offline. Run: python main.py');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="water-bg aurora-bg" style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '2000px' }}>
      <div className="cyber-grid circuit-bg" />
      <div className="tech-grid-overlay" />
      <div className="scanline" />
      
      {/* Data Streams */}
      <div className="data-column" style={{ left: '15%', animationDelay: '0s' }} />
      <div className="data-column" style={{ left: '85%', animationDelay: '1s' }} />

      {/* HUD Rings */}
      <div className="hud-ring" style={{ width: 800, height: 800, opacity: 0.05 }} />
      <div className="hud-ring" style={{ width: 500, height: 500, opacity: 0.08, animationDirection: 'reverse' }} />

      {/* Login Card with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 25, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        whileHover={{ rotateY: 10, rotateX: -10, translateZ: 60 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        ref={containerRef}
        onClick={handleRipple}
        className="ripple-container glass-panel hologram-effect tech-border"
        style={{ width: 440, padding: '52px 40px', zIndex: 10, transformStyle: 'preserve-3d' }}
      >
        {/* Tech Corners */}
        <div className="tech-corner corner-tl" />
        <div className="tech-corner corner-tr" />
        <div className="tech-corner corner-bl" />
        <div className="tech-corner corner-br" />

        <div style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}>
          {/* Logo with Gauge */}
          <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
            <div className="hud-gauge" style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -40, width: 100, height: 100, opacity: 0.3 }} />
            
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 80, height: 80, margin: '0 auto 20px',
                borderRadius: '50%',
                border: '2px solid var(--accent-cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(0,242,255,0.2) 0%, transparent 70%)',
                boxShadow: '0 0 40px rgba(0,242,255,0.3)',
              }}
            >
              <motion.div
                animate={{ translateZ: [0, 30, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: 32 }}
              >
                🛰️
              </motion.div>
            </motion.div>

          <h1 className="font-orbitron shimmer-text scanning-text" style={{ fontSize: 28, fontWeight: 900, letterSpacing: 8 }}>
            SPECTER
          </h1>
          <p className="text-dim font-orbitron" style={{ fontSize: 10, letterSpacing: 5, marginTop: 10, opacity: 0.7 }}>
            OSINT INTELLIGENCE NODE
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'rgba(255,45,85,0.1)',
              border: '1px solid rgba(255,45,85,0.3)',
              borderRadius: 8, fontSize: 12, color: '#ff6b8a',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="font-orbitron" style={{ fontSize: 9, color: 'var(--accent-cyan)', letterSpacing: 3, display: 'block', marginBottom: 6 }}>
            OPERATOR ID
          </label>
          <input
            className="water-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="instagram_username"
            required
            style={{ marginBottom: 20 }}
          />

          <label className="font-orbitron" style={{ fontSize: 9, color: 'var(--accent-cyan)', letterSpacing: 3, display: 'block', marginBottom: 6 }}>
            ACCESS KEY <span className="text-dim">(optional)</span>
          </label>
          <input
            className="water-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ marginBottom: 28 }}
          />

          <button type="submit" className="btn-water" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: 12 }}>
            {loading ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>
                ⟳
              </motion.span>
            ) : '▶ INITIALIZE UPLINK'}
          </button>
        </form>

        <p className="text-dim" style={{ textAlign: 'center', fontSize: 9, marginTop: 24, letterSpacing: 3 }}>
          STEALTH ENGINE v5.0 • PLAYWRIGHT POWERED
        </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
