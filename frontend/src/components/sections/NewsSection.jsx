import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiClock, FiRefreshCw, FiArrowRight, FiTag } from 'react-icons/fi';
import api from '../../utils/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

// Map the THN RSS article shape to what the card needs
function mapArticle(a) {
  return {
    title:       a.title       || '',
    description: a.description || '',
    pubDate:     a.pubDate     || a.publishedAt || '',
    url:         a.link        || a.url         || '#',
    thumbnail:   a.thumbnail   || '',
    categories:  a.categories  || [],
    source:      a.source      || a.source?.name || '',
  };
}

export default function NewsSection() {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = () => {
    setLoading(true);
    api.get('/news')
      .then((r) => {
        const articles = Array.isArray(r.data?.articles) ? r.data.articles : [];
        setNews(articles.slice(0, 6).map(mapArticle));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLive(); }, []);

  return (
    <section id="news" className="py-24 px-6 relative z-10 bg-darker/40">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// 07. CYBER NEWS</p>
          <h2 className="section-title">Security News</h2>
          <p className="section-subtitle">curl -s thehackernews.com/feed | jq</p>
        </div>

        {/* Refresh */}
        <div className="flex justify-end mb-5">
          <button
            onClick={fetchLive}
            disabled={loading}
            className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-primary
                       border border-border hover:border-primary/40 px-4 py-2 rounded transition-all disabled:opacity-40"
          >
            <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'fetching...' : 'refresh --feed'}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && news.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-3 bg-gray-800 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-800 rounded w-full mb-2" />
                <div className="h-4 bg-gray-800 rounded w-4/5 mb-4" />
                <div className="h-3 bg-gray-800 rounded w-full mb-1" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* News grid */}
        {news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((a, i) => (
              <a
                key={a.url + i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Thumbnail */}
                {a.thumbnail && (
                  <div className="w-full h-36 overflow-hidden rounded mb-4 bg-gray-900 flex-shrink-0">
                    <img
                      src={a.thumbnail}
                      alt={a.title}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="font-mono text-[10px] text-primary/70 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded truncate max-w-[130px]">
                    {a.source || (a.categories[0] ?? 'CyberSec')}
                  </span>
                  {a.pubDate && (
                    <span className="flex items-center gap-1 font-mono text-xs text-gray-600 flex-shrink-0">
                      <FiClock size={10} /> {timeAgo(a.pubDate)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-display text-sm font-bold text-white leading-snug mb-3 flex-1 group-hover:text-primary transition-colors">
                  {a.title}
                </h3>

                {/* Description */}
                {a.description && (
                  <p className="font-body text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {a.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center gap-1 font-mono text-xs text-primary/50 group-hover:text-primary transition-colors pt-3 border-t border-border mt-auto">
                  Read more <FiExternalLink size={10} />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <Link to="/news" className="btn-primary gap-2">
            View All News <FiArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
