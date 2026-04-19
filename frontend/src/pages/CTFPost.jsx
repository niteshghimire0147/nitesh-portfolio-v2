import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { FiArrowLeft, FiStar, FiClock } from 'react-icons/fi';
import api from '../utils/api';
import CodeBlock from '../components/CodeBlock';

const DIFF_COLOR = {
  Easy:   'text-green-400',
  Medium: 'text-yellow-400',
  Hard:   'text-red-400',
  Insane: 'text-purple-400',
};

function readingTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return '< 1';
  const mins = Math.round(words / 200);
  return mins < 1 ? '< 1' : mins;
}

const MD_COMPONENTS = {
  code({ inline, className, children }) {
    if (inline) {
      return (
        <code style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.8em',
          background: '#0d1526',
          border: '1px solid #00d4ff22',
          borderRadius: '3px',
          padding: '0.1em 0.4em',
          color: '#00d4ff',
        }}>
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
};

export default function CTFPost() {
  const { slug } = useParams();
  const [ctf,     setCtf]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ctf/${slug}`)
      .then((r) => {
        setCtf(r.data);
        document.title = `${String(r.data.title || '').slice(0, 60)} | CTF | Nitesh Ghimire`;
      })
      .finally(() => setLoading(false));
    return () => { document.title = 'Nitesh Ghimire | Cybersecurity Portfolio'; };
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="font-mono text-primary text-sm animate-pulse">
        <span className="text-gray-600">$ </span>loading writeup<span className="cursor-blink" />
      </div>
    </div>
  );

  if (!ctf) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
      <p className="font-display text-6xl font-black text-primary">404</p>
      <p className="font-mono text-gray-500">Writeup not found</p>
      <Link to="/ctf" className="btn-primary text-sm">← cd ../ctf</Link>
    </div>
  );

  const mins = readingTime(ctf.content);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/ctf"
          className="inline-flex items-center gap-2 font-mono text-sm text-gray-500
                     hover:text-primary transition-colors mb-8"
        >
          <FiArrowLeft size={14} /> cd ../ctf
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="tag">{ctf.platform}</span>
            <span className={`font-mono text-xs font-semibold ${DIFF_COLOR[ctf.difficulty] || 'text-gray-400'}`}>
              ● {ctf.difficulty}
            </span>
            <span className="font-mono text-xs text-gray-600">{ctf.category}</span>
            <span className="flex items-center gap-1 font-mono text-xs text-primary">
              <FiStar size={10} /> {ctf.points} pts
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
              <FiClock size={10} /> {mins} min{mins !== '< 1' && 's'} read
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {ctf.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {ctf.tags?.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="card prose-dark">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={MD_COMPONENTS}
          >
            {ctf.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
