import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

export default function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const lang = (className || '').replace('language-', '') || 'code';

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', margin: '1rem 0' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d1526',
        border: '1px solid #00d4ff22',
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
        padding: '0.4rem 0.75rem',
      }}>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: '#4a5568' }}>
          {lang}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.7rem',
            color: copied ? '#00ff88' : '#4a5568',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.color = '#00d4ff'; }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.color = '#4a5568'; }}
        >
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <pre style={{
        background: '#060a14',
        border: '1px solid #00d4ff22',
        borderRadius: '0 0 6px 6px',
        padding: '1rem',
        overflowX: 'auto',
        margin: 0,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.8rem',
        lineHeight: '1.6',
        color: '#c9d1d9',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
