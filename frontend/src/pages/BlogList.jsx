import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiEye, FiTag, FiSearch, FiX } from 'react-icons/fi';
import api from '../utils/api';

function readingTime(content = '') {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogList() {
  const [blogs,    setBlogs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    api.get('/blogs')
      .then((r) => setBlogs(r.data.blogs || []))
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = [...new Set(blogs.flatMap(b => b.tags || []))].sort();

  const filtered = blogs.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.title?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q);
    const matchTag = !activeTag || (b.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  const clearFilters = () => { setSearch(''); setActiveTag(''); };
  const hasFilter = search || activeTag;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="font-mono text-primary text-sm animate-pulse">
        <span className="text-gray-600">$ </span>fetching posts<span className="cursor-blink" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// WRITE-UPS</p>
          <h1 className="section-title">Blog & Write-ups</h1>
          <p className="section-subtitle">cat ~/blog/*.md | less</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="input w-full pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors">
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                className={`flex items-center gap-1 px-3 py-1 font-mono text-xs rounded border transition-all ${
                  activeTag === tag
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-gray-500 hover:border-primary/40 hover:text-gray-300'
                }`}
              >
                <FiTag size={9} /> {tag}
              </button>
            ))}
          </div>
        )}

        {/* Result count + clear */}
        {hasFilter && (
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-xs text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <button onClick={clearFilters} className="font-mono text-xs text-primary hover:text-white transition-colors flex items-center gap-1">
              <FiX size={11} /> Clear filters
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="card text-center py-20 border-dashed">
            <p className="font-mono text-4xl mb-4">📝</p>
            <p className="font-mono text-sm text-gray-500">
              {hasFilter ? '// No posts match your search.' : '// No posts yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((b) => (
              <Link
                key={b._id}
                to={`/blog/${b.slug}`}
                className="card group block hover:border-primary/40 hover:-translate-x-1 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="tag">{b.category}</span>
                      <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
                        <FiCalendar size={10} /> {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
                        <FiEye size={10} /> {b.views}
                      </span>
                      <span className="font-mono text-xs text-gray-600">
                        {readingTime(b.content || b.excerpt)} min read
                      </span>
                    </div>
                    <h2 className="font-display text-base font-bold text-white group-hover:text-primary transition-colors mb-1">
                      {b.title}
                    </h2>
                    <p className="font-body text-sm text-gray-400 leading-relaxed">{b.excerpt}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {b.tags?.slice(0, 3).map((t) => (
                      <button
                        key={t}
                        onClick={e => { e.preventDefault(); setActiveTag(activeTag === t ? '' : t); }}
                        className={`flex items-center gap-1 tag text-xs transition-all ${activeTag === t ? 'border-primary text-primary' : ''}`}
                      >
                        <FiTag size={9} />{t}
                      </button>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
