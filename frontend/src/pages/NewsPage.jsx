import { useState, useEffect, useCallback } from 'react';
import { FiExternalLink, FiCalendar, FiRefreshCw, FiShield, FiTag } from 'react-icons/fi';
import api from '../utils/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function NewsPage() {
  const [articles,  setArticles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [fetchedAt, setFetchedAt] = useState('');
  const [search,    setSearch]    = useState('');
  const [stale,     setStale]     = useState(false);

  const load = useCallback((force = false) => {
    setLoading(true);
    setError('');
    const url = force ? '/news?bust=' + Date.now() : '/news';
    api.get(url)
      .then((r) => {
        setArticles(Array.isArray(r.data.articles) ? r.data.articles : []);
        setFetchedAt(r.data.fetchedAt || '');
        setStale(!!r.data.stale);
      })
      .catch(() => setError('Could not load news. Try again later.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = articles.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.categories || []).some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// CYBER INTEL</p>
          <h1 className="section-title">Security News</h1>
          <p className="section-subtitle flex items-center justify-center gap-2">
            <FiShield size={12} className="text-primary" />
            live feed from thehackernews.com
          </p>
          {fetchedAt && (
            <p className="font-mono text-[11px] text-gray-600 mt-3">
              {stale ? '⚠ cached · ' : ''}last fetched {timeAgo(fetchedAt)}
            </p>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-primary text-xs">$</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="input w-full pl-8"
            />
          </div>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="btn-primary gap-2 disabled:opacity-50 flex-shrink-0"
          >
            <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="text-center py-24">
            <p className="font-mono text-primary text-sm animate-pulse">
              <span className="text-gray-600">$ </span>curl thehackernews.com/feed
              <span className="cursor-blink" />
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="card border-red-500/30 text-center py-16">
            <p className="font-mono text-sm text-red-400 mb-4">{error}</p>
            <button onClick={() => load()} className="btn-primary">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="card text-center py-20 border-dashed">
            <p className="font-mono text-4xl mb-4">📡</p>
            <p className="font-mono text-sm text-gray-500">
              {search ? '// No articles match your search.' : '// No articles available right now.'}
            </p>
          </div>
        )}

        {/* ── News Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="font-mono text-xs text-gray-600 mb-5">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((article, i) => (
                <a
                  key={article.link + i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Thumbnail */}
                  {article.thumbnail && (
                    <div className="w-full h-40 overflow-hidden rounded mb-4 bg-gray-900 flex-shrink-0">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Source + Categories */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.source && (
                      <span className="font-mono text-[10px] text-primary/70 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                        {article.source}
                      </span>
                    )}
                    {article.categories?.slice(0, 1).map((cat, ci) => (
                      <span key={ci} className="flex items-center gap-1 tag text-[10px]">
                        <FiTag size={8} /> {cat}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors mb-2 leading-snug flex-1">
                    {article.title}
                  </h2>

                  {/* Description */}
                  {article.description && (
                    <p className="font-body text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
                      {article.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-gray-600">
                      <FiCalendar size={9} />
                      {formatDate(article.pubDate)}
                      {article.pubDate && (
                        <span className="text-gray-700">· {timeAgo(article.pubDate)}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-primary/60 group-hover:text-primary transition-colors">
                      Read <FiExternalLink size={9} />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Source credits */}
            <div className="text-center mt-12 flex flex-wrap justify-center gap-4">
              <a href="https://thehackernews.com" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <FiShield size={11} /> The Hacker News <FiExternalLink size={10} />
              </a>
              <a href="https://www.paloaltonetworks.com/blog/" target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <FiShield size={11} /> Palo Alto Networks Blog <FiExternalLink size={10} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
