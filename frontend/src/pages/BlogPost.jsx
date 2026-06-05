import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { FiArrowLeft, FiCalendar, FiEye, FiTag, FiClock, FiDownload } from 'react-icons/fi';
import api from '../utils/api';
import CodeBlock from '../components/CodeBlock';
import { useSEO } from '../hooks/useSEO';

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
  img({ src, alt, ...props }) {
    const fixedSrc = typeof src === 'string' && src.startsWith('/uploads/')
      ? src.replace(/^\/uploads\//, '/api/uploads/')
      : src;
    return <img src={fixedSrc} alt={alt} {...props} className="max-w-full h-auto rounded" />;
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const [blog,    setBlog]    = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: blog ? blog.title : 'Loading Post...',
    description: blog ? (blog.excerpt || blog.content?.slice(0, 160)) : 'Cybersecurity writeup and analysis.',
    keywords: blog ? (blog.tags || []).join(', ') : 'cybersecurity, vulnerability, writeup',
    canonical: `https://niteshg.com.np/blog/${slug}`,
    type: 'article',
    article: blog ? {
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      tags: blog.tags,
    } : undefined,
  });

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then((r) => {
        setBlog(r.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="font-mono text-primary text-sm animate-pulse">
        <span className="text-gray-600">$ </span>loading post<span className="cursor-blink" />
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
      <p className="font-display text-6xl font-black text-primary">404</p>
      <p className="font-mono text-gray-500">Post not found</p>
      <Link to="/blog" className="btn-primary text-sm">← cd ../blog</Link>
    </div>
  );

  const mins = readingTime(blog.content);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-sm text-gray-500
                     hover:text-primary transition-colors mb-8"
        >
          <FiArrowLeft size={14} /> cd ../blog
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="tag">{blog.category}</span>
            <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
              <FiCalendar size={10} /> {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
              <FiEye size={10} /> {blog.views} views
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
              <FiClock size={10} /> {mins} min{mins !== '< 1' && 's'} read
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {blog.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {blog.tags?.map((t) => (
              <span key={t} className="flex items-center gap-1 tag">
                <FiTag size={9} />{t}
              </span>
            ))}
          </div>
        </div>

        {blog.pdfUrl && (
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch(blog.pdfUrl);
                if (!res.ok) throw new Error('Download failed');
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href     = url;
                a.download = `${(blog.title || 'document').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch {
                window.open(blog.pdfUrl, '_blank');
              }
            }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2.5 border border-primary/40
                       bg-primary/5 text-primary font-mono text-xs rounded hover:bg-primary/10
                       transition-colors cursor-pointer"
          >
            <FiDownload size={13} /> Download PDF
          </button>
        )}

        <div className="card prose-dark">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={MD_COMPONENTS}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
