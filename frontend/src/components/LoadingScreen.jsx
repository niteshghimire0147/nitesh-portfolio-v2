import { useState, useEffect } from 'react';

const LINES = [
  { text: 'Initializing security modules...', delay: 0 },
  { text: 'Loading exploit framework...  [OK]', delay: 300 },
  { text: 'Mounting encrypted volumes...  [OK]', delay: 600 },
  { text: 'Starting VPN tunnel...         [OK]', delay: 900 },
  { text: 'Portfolio ready.', delay: 1200, highlight: true },
];

export default function LoadingScreen({ onDone }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [fading,       setFading]       = useState(false);

  useEffect(() => {
    const timers = LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), LINES[i].delay)
    );
    const fadeTimer  = setTimeout(() => setFading(true),  1700);
    const doneTimer  = setTimeout(() => onDone(),         2100);
    return () => [...timers, fadeTimer, doneTimer].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050d1a',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}
    >
      {/* Logo */}
      <div style={{
        fontFamily: '"Orbitron", sans-serif',
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
        fontWeight: 900,
        color: '#00d4ff',
        textShadow: '0 0 30px #00d4ff88',
        letterSpacing: '0.3em',
        marginBottom: '2.5rem',
      }}>
        NITESH.DEV
      </div>

      {/* Terminal */}
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.75rem',
        color: '#4a5568',
        width: 'min(400px, 90vw)',
        background: '#0d1526',
        border: '1px solid #00d4ff22',
        borderRadius: '6px',
        padding: '1.25rem 1.5rem',
        lineHeight: '1.8',
      }}>
        <div style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>
          nitesh@kali:~$ ./init.sh
        </div>
        {LINES.map((line, i) => (
          i < visibleLines && (
            <div
              key={i}
              style={{
                color: line.highlight ? '#00ff88' : '#4a5568',
                fontWeight: line.highlight ? 'bold' : 'normal',
              }}
            >
              {line.text}
            </div>
          )
        ))}
        {visibleLines < LINES.length && (
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '14px',
            background: '#00d4ff',
            animation: 'blink 1s step-end infinite',
            verticalAlign: 'middle',
          }} />
        )}
      </div>
    </div>
  );
}
