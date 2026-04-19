import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

function useGlitch(text, active) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let frame = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (frame > i * 2) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      frame++;
      if (frame > text.length * 3) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text, active]);

  return display;
}

export default function NotFound() {
  const navigate = useNavigate();
  const [glitchActive, setGlitchActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const heading = useGlitch('404 — ACCESS DENIED', glitchActive);

  useEffect(() => {
    setGlitchActive(true);
    const timer = setTimeout(() => setGlitchActive(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) { clearInterval(tick); navigate('/'); }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* grid bg */}
      <div className="cyber-grid fixed inset-0 pointer-events-none opacity-30 z-0" aria-hidden="true" />

      {/* scan line flicker */}
      <div className="scanline" aria-hidden="true" />

      <div className="relative z-10 text-center max-w-xl w-full">
        {/* big 404 */}
        <div
          className="text-[120px] md:text-[180px] font-bold leading-none select-none"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: 'transparent',
            WebkitTextStroke: '2px #00d4ff',
            textShadow: '0 0 40px #00d4ff55, 0 0 80px #00d4ff22',
          }}
        >
          404
        </div>

        {/* heading */}
        <h1
          className="text-xl md:text-2xl font-bold mb-4 tracking-widest"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            color: '#00d4ff',
            textShadow: '0 0 10px #00d4ff88',
          }}
        >
          {heading}
        </h1>

        {/* terminal block */}
        <div
          className="text-left mx-auto mb-8 p-4 rounded border text-sm"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            background: '#0d1526cc',
            borderColor: '#00d4ff33',
            color: '#8892a4',
            maxWidth: '420px',
          }}
        >
          <p><span style={{ color: '#00d4ff' }}>$</span> curl {window.location.pathname}</p>
          <p className="mt-1"><span style={{ color: '#ff4d4d' }}>Error:</span> The resource you requested does not exist.</p>
          <p className="mt-1"><span style={{ color: '#00d4ff' }}>→</span> Redirecting to <span style={{ color: '#00ff88' }}>/</span> in{' '}
            <span style={{ color: '#ffd700' }}>{countdown}s</span>
          </p>
        </div>

        {/* buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded font-semibold text-sm tracking-wider transition-all duration-200"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              background: 'transparent',
              border: '1px solid #00d4ff',
              color: '#00d4ff',
              boxShadow: '0 0 10px #00d4ff33',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#00d4ff22';
              e.currentTarget.style.boxShadow = '0 0 20px #00d4ff66';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = '0 0 10px #00d4ff33';
            }}
          >
            ← Return Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded font-semibold text-sm tracking-wider transition-all duration-200"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              background: 'transparent',
              border: '1px solid #8892a4',
              color: '#8892a4',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#00d4ff';
              e.currentTarget.style.color = '#00d4ff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#8892a4';
              e.currentTarget.style.color = '#8892a4';
            }}
          >
            ↩ Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
