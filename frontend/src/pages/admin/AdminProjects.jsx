import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiGithub, FiExternalLink, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { STATIC_PROJECTS } from '../../data/staticProjects';

const EMPTY = { title: '', description: '', techStack: '', category: 'Development', githubUrl: '', liveUrl: '', featured: false, hidden: false, order: 0 };

function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminProjects() {
  const [cmsProjects, setCmsProjects] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [ghLoading,   setGhLoading]   = useState(true);
  const [form,        setForm]        = useState(EMPTY);
  const [editing,     setEditing]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [actionId,    setActionId]    = useState(null);

  // ── fetch CMS projects (admin endpoint — includes hidden) ──────
  const loadCms = () =>
    api.get('/projects/admin')
      .then((r) => setCmsProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => api.get('/projects').then((r) => setCmsProjects(Array.isArray(r.data) ? r.data : [])));

  // ── fetch GitHub repos ─────────────────────────────────────────
  const loadGithub = () => {
    setGhLoading(true);
    api.get('/github/repos')
      .then((r) => {
        if (!Array.isArray(r.data)) return;
        setGithubRepos(
          r.data
            .filter((repo) => !repo.fork && repo.description)
            .map((repo) => ({
              _ghId:       repo.id,
              title:       toTitleCase(repo.name),
              description: repo.description || '',
              techStack:   repo.language ? [repo.language] : [],
              category:    'Development',
              githubUrl:   repo.html_url,
              liveUrl:     repo.homepage || '',
              stars:       repo.stargazers_count,
              forks:       repo.forks_count,
              featured:    repo.stargazers_count > 0,
              hidden:      false,
              order:       0,
              _source:     'github',
            }))
        );
      })
      .catch(() => {})
      .finally(() => setGhLoading(false));
  };

  useEffect(() => { loadCms(); loadGithub(); }, []);

  const set      = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  // ── build unified list ─────────────────────────────────────────
  // cmsKeys includes ALL cms projects (hidden + deleted) so they never ghost back
  const cmsKeys = new Set(cmsProjects.map((p) => p.title.toLowerCase().trim()));

  // Only display non-deleted CMS projects (deleted ones stay in cmsKeys silently)
  const displayedCms = cmsProjects.filter((p) => !p.deleted);

  // Static projects not yet managed by CMS at all
  const staticOnly = STATIC_PROJECTS
    .filter((s) => !cmsKeys.has(s.title.toLowerCase().trim()))
    .map((s) => ({ ...s, _source: 'static' }));

  // GitHub repos not yet in CMS or static
  const allKnownKeys = new Set([
    ...cmsKeys,
    ...STATIC_PROJECTS.map((s) => s.title.toLowerCase().trim()),
  ]);
  const ghOnly = githubRepos.filter((r) => !allKnownKeys.has(r.title.toLowerCase().trim()));

  // Final unified list: visible CMS first, then static, then GitHub
  const allItems = [...displayedCms, ...staticOnly, ...ghOnly];

  // ── auto-import non-CMS items to DB on first action ───────────
  const ensureInCms = async (item) => {
    if (item._id) return item;
    const payload = {
      title:       item.title,
      description: item.description,
      techStack:   Array.isArray(item.techStack) ? item.techStack : [],
      category:    item.category || 'Development',
      githubUrl:   item.githubUrl || '',
      liveUrl:     item.liveUrl   || '',
      featured:    item.featured  || false,
      hidden:      item.hidden    || false,
      order:       item.order     || 0,
    };
    const res = await api.post('/projects', payload);
    await loadCms();
    return res.data;
  };

  // ── form submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean),
      order:     Number(form.order),
    };
    try {
      if (editing) {
        await api.put(`/projects/${editing}`, payload);
        toast.success('Updated!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project added!');
      }
      setEditing(null);
      setForm(EMPTY);
      loadCms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    } finally { setLoading(false); }
  };

  const cancelEdit = () => { setEditing(null); setForm(EMPTY); };

  // ── edit ───────────────────────────────────────────────────────
  const startEdit = async (item) => {
    setActionId(item._id || item._ghId || item.title);
    try {
      const saved = await ensureInCms(item);
      setEditing(saved._id);
      setForm({ ...saved, techStack: (saved.techStack || []).join(', ') });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { toast.error('Could not load project for editing'); }
    finally { setActionId(null); }
  };

  // ── delete (soft) ──────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    setActionId(item._id || item._ghId || item.title);
    try {
      const saved = await ensureInCms(item);
      await api.delete(`/projects/${saved._id}`);
      toast.success('Deleted');
      loadCms();
    } catch { toast.error('Delete failed'); }
    finally { setActionId(null); }
  };

  // ── hide / show toggle ─────────────────────────────────────────
  const toggleHidden = async (item) => {
    setActionId(item._id || item._ghId || item.title);
    try {
      const saved    = await ensureInCms(item);
      const newHidden = !saved.hidden;
      await api.put(`/projects/${saved._id}`, { ...saved, techStack: saved.techStack, hidden: newHidden });
      toast.success(newHidden ? 'Project hidden from portfolio' : 'Project visible on portfolio');
      loadCms();
    } catch { toast.error('Update failed'); }
    finally { setActionId(null); }
  };

  // ── feature toggle ─────────────────────────────────────────────
  const toggleFeatured = async (item) => {
    setActionId(item._id || item._ghId || item.title);
    try {
      const saved = await ensureInCms(item);
      await api.put(`/projects/${saved._id}`, { ...saved, techStack: saved.techStack, featured: !saved.featured });
      toast.success(!item.featured ? '★ Marked as featured' : 'Removed from featured');
      loadCms();
    } catch { toast.error('Update failed'); }
    finally { setActionId(null); }
  };

  return (
    <AdminLayout title="Projects">

      {/* ── Add / Edit Form ── */}
      <div className="card mb-8">
        <h2 className="font-mono text-xs text-primary mb-6 tracking-widest">
          {editing ? '// EDIT PROJECT' : '// NEW PROJECT'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> title *</label>
              <input required type="text" value={form.title} onChange={set('title')} placeholder="Project name" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> category</label>
              <select value={form.category} onChange={set('category')} className="input">
                {['Development', 'Cybersecurity', 'Academic'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> tech stack (comma-separated)</label>
              <input type="text" value={form.techStack} onChange={set('techStack')} placeholder="Python, Django, React, MongoDB" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> GitHub URL</label>
              <input type="url" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/..." className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> Live URL (optional)</label>
              <input type="url" value={form.liveUrl} onChange={set('liveUrl')} placeholder="https://..." className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> display order</label>
              <input type="number" min="0" value={form.order} onChange={set('order')} className="input" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> description *</label>
            <textarea required rows={3} value={form.description} onChange={set('description')} placeholder="What this project does..." className="input resize-none" />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={setCheck('featured')} className="accent-primary w-3.5 h-3.5" />
              ★ Featured project (shown first)
            </label>
            <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.hidden} onChange={setCheck('hidden')} className="accent-primary w-3.5 h-3.5" />
              Hide from portfolio
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ── Unified Project List ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-xs text-primary tracking-widest">
            // ALL PROJECTS ({allItems.length})
            {ghLoading && <span className="text-gray-600 ml-2">— fetching GitHub...</span>}
          </h2>
          <button
            onClick={() => { loadCms(); loadGithub(); }}
            className="flex items-center gap-1.5 font-mono text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>

        {allItems.length === 0 && !ghLoading ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">No projects found.</p>
        ) : (
          <div className="space-y-2">
            {allItems.map((item, i) => {
              const uid       = item._id || `gh-${item._ghId}` || `st-${item.title}`;
              const isCms     = !!item._id;
              const isHidden  = !!item.hidden;
              const isWorking = actionId === (item._id || item._ghId || item.title);
              const source    = isCms ? 'cms' : item._source;

              return (
                <div
                  key={uid + i}
                  className={`flex items-center justify-between p-4 border rounded transition-colors gap-4 ${
                    isWorking  ? 'border-primary/40 opacity-50' :
                    isHidden   ? 'border-border/40 bg-gray-900/30 opacity-60' :
                    'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* source badge */}
                      {source === 'github' && <FiGithub size={12} className="text-gray-500 flex-shrink-0" title="From GitHub" />}

                      <p className={`font-mono text-sm truncate ${isHidden ? 'text-gray-500' : 'text-white'}`}>
                        {item.title}
                      </p>

                      {item.featured && !isHidden && (
                        <span className="font-mono text-xs text-yellow-400 flex-shrink-0">★ Featured</span>
                      )}
                      {isHidden && (
                        <span className="font-mono text-[10px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
                          Hidden
                        </span>
                      )}
                      {source === 'static' && (
                        <span className="font-mono text-[10px] text-blue-400/60 border border-blue-400/20 px-1.5 py-0.5 rounded flex-shrink-0">
                          Static
                        </span>
                      )}
                      {source === 'github' && (
                        <span className="font-mono text-[10px] text-primary/50 border border-primary/20 px-1.5 py-0.5 rounded flex-shrink-0">
                          GitHub
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1">
                      <span className="font-mono text-xs text-gray-600">{item.category}</span>
                      <span className="font-mono text-xs text-gray-700">
                        {(item.techStack || []).slice(0, 3).join(', ')}
                      </span>
                      {item.stars > 0 && (
                        <span className="font-mono text-xs text-gray-600">★ {item.stars}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0 items-center">
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-primary rounded transition-colors" title="View on GitHub">
                        <FiGithub size={14} />
                      </a>
                    )}
                    {item.liveUrl && (
                      <a href={item.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-primary rounded transition-colors" title="Live site">
                        <FiExternalLink size={14} />
                      </a>
                    )}

                    {/* ★ Feature toggle */}
                    <button
                      onClick={() => toggleFeatured(item)}
                      disabled={isWorking}
                      title={item.featured ? 'Remove from featured' : 'Mark as featured'}
                      className={`p-2 rounded transition-colors text-lg leading-none disabled:opacity-40 ${
                        item.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-600 hover:text-yellow-400'
                      }`}
                    >
                      {item.featured ? '★' : '☆'}
                    </button>

                    {/* 👁 Hide / Show toggle */}
                    <button
                      onClick={() => toggleHidden(item)}
                      disabled={isWorking}
                      title={isHidden ? 'Show on portfolio' : 'Hide from portfolio'}
                      className={`p-2 rounded transition-colors disabled:opacity-40 ${
                        isHidden ? 'text-gray-600 hover:text-green-400' : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      {isHidden ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>

                    {/* ✏️ Edit */}
                    <button
                      onClick={() => startEdit(item)}
                      disabled={isWorking}
                      title="Edit"
                      className="p-2 text-gray-500 hover:text-primary rounded transition-colors disabled:opacity-40"
                    >
                      <FiEdit2 size={15} />
                    </button>

                    {/* 🗑 Delete — only for CMS and Static projects, not GitHub repos */}
                    {source !== 'github' && (
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={isWorking}
                        title="Delete from portfolio"
                        className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors disabled:opacity-40"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
