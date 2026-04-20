import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiSearch, FiX } from 'react-icons/fi';
import api from '../utils/api';

const DIFF_CLASS = {
  Easy:   'badge-easy',
  Medium: 'badge-medium',
  Hard:   'badge-hard',
  Insane: 'badge-insane',
};

export default function CTFList() {
  const [ctfs,      setCtfs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [platform,  setPlatform]  = useState('All');
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    api.get('/ctf')
      .then((r) => setCtfs(Array.isArray(r.data?.ctfs) ? r.data.ctfs : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const platforms  = ['All', ...new Set(ctfs.map(c => c.platform))];
  const categories = ['All', ...new Set(ctfs.map(c => c.category).filter(Boolean))];

  const shown = ctfs.filter(c => {
    const q = search.toLowerCase();
    const matchSearch   = !q || c.title?.toLowerCase().includes(q) || c.excerpt?.toLowerCase().includes(q);
    const matchPlatform = platform === 'All' || c.platform === platform;
    const matchCategory = category === 'All' || c.category === category;
    return matchSearch && matchPlatform && matchCategory;
  });

  const clearFilters = () => { setSearch(''); setPlatform('All'); setCategory('All'); };
  const hasFilter = search || platform !== 'All' || category !== 'All';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="font-mono text-primary text-sm animate-pulse">
        <span className="text-gray-600">$ </span>loading writeups<span className="cursor-blink" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest">// CTF WRITEUPS</p>
          <h1 className="section-title">CTF Write-ups</h1>
          <p className="section-subtitle">find ~/ctf/ -name &quot;*.md&quot; -exec cat {'{'} \;</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search write-ups..."
            className="input w-full pl-9 pr-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors">
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-4 mb-8 items-start">
          {/* Platform filter */}
          {platforms.length > 1 && (
            <div>
              <p className="font-mono text-xs text-gray-600 mb-2">Platform</p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 font-mono text-xs rounded border transition-all ${
                      platform === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-gray-500 hover:border-primary/40 hover:text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          {categories.length > 2 && (
            <div>
              <p className="font-mono text-xs text-gray-600 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 font-mono text-xs rounded border transition-all ${
                      category === cat
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-gray-500 hover:border-primary/40 hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result count + clear */}
        {hasFilter && (
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-xs text-gray-500">
              {shown.length} result{shown.length !== 1 ? 's' : ''}
            </span>
            <button onClick={clearFilters} className="font-mono text-xs text-primary hover:text-white transition-colors flex items-center gap-1">
              <FiX size={11} /> Clear filters
            </button>
          </div>
        )}

        {shown.length === 0 ? (
          <div className="card text-center py-20 border-dashed">
            <p className="font-mono text-4xl mb-4">🚩</p>
            <p className="font-mono text-sm text-gray-500">
              {hasFilter ? '// No write-ups match your search.' : '// No CTF writeups yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shown.map((c) => (
              <Link
                key={c._id}
                to={`/ctf/${c.slug}`}
                className="card group block hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary/70 border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                    {c.platform}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.category && (
                      <span className="font-mono text-xs text-gray-600">{c.category}</span>
                    )}
                    <span className={DIFF_CLASS[c.difficulty] || 'tag'}>
                      {c.difficulty}
                    </span>
                  </div>
                </div>
                <h2 className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors mb-2">
                  {c.title}
                </h2>
                <p className="font-body text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {c.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags?.slice(0, 3).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs text-primary">
                    <FiStar size={10} /> {c.points} pts
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
