import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', techStack: '', category: 'Development', githubUrl: '', liveUrl: '', featured: false, order: 0 };

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  const load = () => api.get('/projects').then((r) => setProjects(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({ ...p, techStack: (p.techStack || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean),
      order: Number(form.order),
    };
    try {
      if (editing) { await api.put(`/projects/${editing}`, payload); toast.success('Updated!'); }
      else         { await api.post('/projects', payload);           toast.success('Created!'); }
      cancelEdit(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout title="Projects">
      {/* ── Form ── */}
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

          <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer w-fit">
            <input type="checkbox" checked={form.featured} onChange={setCheck('featured')} className="accent-primary w-3.5 h-3.5" />
            Featured project (shown first)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ── List ── */}
      <div className="card">
        <h2 className="font-mono text-xs text-primary mb-5 tracking-widest">// ALL PROJECTS ({projects.length})</h2>
        {projects.length === 0 ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-4 border border-border rounded hover:border-primary/30 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-white truncate">{p.title}</p>
                    {p.featured && <FiStar size={12} className="text-yellow-400 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="font-mono text-xs text-gray-600">{p.category}</span>
                    <span className="font-mono text-xs text-gray-700">{(p.techStack || []).slice(0, 3).join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(p)} className="p-2 text-gray-500 hover:text-primary rounded transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
