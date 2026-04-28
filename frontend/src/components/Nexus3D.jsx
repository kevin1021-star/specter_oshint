import React from 'react';
import { motion } from 'framer-motion';

const Nexus3D = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 1,
      transformStyle: 'preserve-3d',
      perspective: '1000px'
    }}>
      <div className="wireframe-cube">
        <div className="wireframe-face" style={{ transform: 'translateZ(50px)' }} />
        <div className="wireframe-face" style={{ transform: 'rotateY(90deg) translateZ(50px)' }} />
        <div className="wireframe-face" style={{ transform: 'rotateY(180deg) translateZ(50px)' }} />
        <div className="wireframe-face" style={{ transform: 'rotateY(-90deg) translateZ(50px)' }} />
        <div className="wireframe-face" style={{ transform: 'rotateX(90deg) translateZ(50px)' }} />
        <div className="wireframe-face" style={{ transform: 'rotateX(-90deg) translateZ(50px)' }} />
      </div>

      {/* Floating 3D Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 300,
            height: 300,
            border: '1px dashed var(--accent-cyan)',
            borderRadius: '50%',
            opacity: 0.1,
            transformStyle: 'preserve-3d'
          }}
        />
      ))}
    </div>
  );
};

export default Nexus3D;
