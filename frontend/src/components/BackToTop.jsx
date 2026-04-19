import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 50,
        width: '44px',
        height: '44px',
        border: '1px solid #00d4ff55',
        borderRadius: '6px',
        background: '#0d1526cc',
        color: '#00d4ff',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 16px #00d4ff22',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#00d4ff22';
        e.currentTarget.style.boxShadow = '0 0 24px #00d4ff44';
        e.currentTarget.style.borderColor = '#00d4ff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#0d1526cc';
        e.currentTarget.style.boxShadow = '0 0 16px #00d4ff22';
        e.currentTarget.style.borderColor = '#00d4ff55';
      }}
    >
      <FiArrowUp size={18} />
    </button>
  );
}
