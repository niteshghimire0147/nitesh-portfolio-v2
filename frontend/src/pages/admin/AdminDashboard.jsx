import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiFlag, FiFolder, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const CARDS = [
  { key: 'blogs',        label: 'Blog Posts',    icon: FiFileText,     href: '/admin/blogs',        color: '#00d4ff' },
  { key: 'ctf',          label: 'CTF Writeups',  icon: FiFlag,         href: '/admin/ctf',          color: '#0066ff' },
  { key: 'projects',     label: 'Projects',      icon: FiFolder,       href: '/admin/projects',     color: '#00ff88' },
  { key: 'testimonials', label: 'Testimonials',  icon: FiMessageSquare,href: '/admin/testimonials', color: '#ff9900' },
];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ blogs: 0, ctf: 0, projects: 0, testimonials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/blogs/admin/all').catch(() => ({ data: [] })),
      api.get('/ctf/admin/all').catch(() => ({ data: [] })),
      api.get('/projects').catch(() => ({ data: [] })),
      api.get('/testimonials/admin/all').catch(() => ({ data: [] })),
    ]).then(([blogs, ctf, projects, testimonials]) => {
      setStats({
        blogs:        Array.isArray(blogs.data)        ? blogs.data.length        : 0,
        ctf:          Array.isArray(ctf.data)          ? ctf.data.length          : 0,
        projects:     Array.isArray(projects.data)     ? projects.data.length     : 0,
        testimonials: Array.isArray(testimonials.data) ? testimonials.data.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {CARDS.map(({ key, label, icon: Icon, href, color }) => (
          <Link
            key={key}
            to={href}
            className="card group hover:border-primary/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <Icon size={22} style={{ color }} />
              <span className="font-display text-3xl font-bold" style={{ color }}>
                {loading ? '—' : stats[key]}
              </span>
            </div>
            <p className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-mono text-xs text-primary mb-5 tracking-widest">// QUICK ACTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CARDS.map(({ label, href, color }) => (
            <Link
              key={href}
              to={href}
              className="flex items-center justify-between px-4 py-3 border border-border rounded
                         font-mono text-xs text-gray-500 hover:border-primary/40 hover:text-gray-300
                         transition-all group"
            >
              <span>
                <span style={{ color }} className="mr-2">›</span>
                {label === 'Testimonials' ? 'Review ' : 'New '}{label}
              </span>
              <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-6 card border-primary/20 bg-primary/5">
        <p className="font-mono text-xs text-gray-500 leading-relaxed">
          <span className="text-primary">// TIP:</span> Use the sidebar to manage content. All changes are
          reflected on your public portfolio immediately after saving.
        </p>
      </div>
    </AdminLayout>
  );
}
