import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiFileText, FiFlag, FiFolder, FiSettings,
  FiMessageSquare, FiLogOut, FiShield, FiExternalLink, FiLock,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ADMIN } from '../config/adminPath';

const buildNav = (a) => [
  { href: `/${a}`,              label: 'Dashboard',    icon: FiGrid,          exact: true },
  { href: `/${a}/site-config`,  label: 'Site Config',  icon: FiSettings },
  { href: `/${a}/blogs`,        label: 'Blogs',        icon: FiFileText },
  { href: `/${a}/ctf`,          label: 'CTF Writeups', icon: FiFlag },
  { href: `/${a}/projects`,     label: 'Projects',     icon: FiFolder },
  { href: `/${a}/testimonials`, label: 'Testimonials', icon: FiMessageSquare },
  { href: `/${a}/settings`,     label: 'Security',     icon: FiLock },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const NAV       = buildNav(ADMIN);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.href
      : location.pathname.startsWith(item.href);

  const handleLogout = async () => {
    await logout();
    navigate(`/${ADMIN}/login`);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="w-60 bg-darker border-r border-border flex flex-col fixed top-0 left-0 h-full z-40">

        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2 mb-1 group">
            <FiShield className="text-primary" size={18} />
            <span className="font-display text-xs font-bold text-primary tracking-widest">
              NITESH CMS
            </span>
          </Link>
          <p className="font-mono text-xs text-gray-600 mt-1">
            Welcome, <span className="text-gray-400">{user?.username}</span>
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs transition-all duration-200 ${
                isActive({ href, exact })
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs
                       text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <FiExternalLink size={15} /> View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded font-mono text-xs
                       text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <main className="ml-60 flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto p-8">
          {title && (
            <div className="mb-8 pb-5 border-b border-border flex items-center gap-3">
              <span className="text-primary font-mono text-sm">//</span>
              <h1 className="font-display text-xl font-bold text-white">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
