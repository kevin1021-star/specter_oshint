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
      <div className="cyber-grid" />
      <div className="scanline" />
      
      {/* HUD Rings */}
      <div className="hud-ring" style={{ width: 600, height: 600, opacity: 0.1 }} />
      <div className="hud-ring" style={{ width: 400, height: 400, opacity: 0.05, animationDirection: 'reverse' }} />

      {/* Bubbles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bubble" style={{
          width: `${8 + Math.random() * 20}px`,
          height: `${8 + Math.random() * 20}px`,
          left: `${10 + Math.random() * 80}%`,
          animationDuration: `${6 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}

      {/* Waves */}
      <div className="wave-container">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>

      {/* Login Card with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        whileHover={{ rotateY: 5, rotateX: -5, translateZ: 50 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        ref={containerRef}
        onClick={handleRipple}
        className="ripple-container glass-panel hologram-effect tech-border"
        style={{ width: 420, padding: '48px 40px', zIndex: 10, transformStyle: 'preserve-3d' }}
      >
        <div style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 80, height: 80, margin: '0 auto 20px',
                borderRadius: '50%',
                border: '2px solid rgba(0,242,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(0,242,255,0.2) 0%, transparent 70%)',
                boxShadow: '0 0 30px rgba(0,242,255,0.2)',
              }}
            >
              <motion.div
                animate={{ translateZ: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 32 }}
              >
                🌊
              </motion.div>
            </motion.div>

          <h1 className="font-orbitron shimmer-text" style={{ fontSize: 24, fontWeight: 800, letterSpacing: 6 }}>
            SPECTER
          </h1>
          <p className="text-dim" style={{ fontSize: 11, letterSpacing: 4, marginTop: 8 }}>
            OSINT INTELLIGENCE FRAMEWORK
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
      </motion.div>
    </div>
  );
};

export default LoginScreen;
