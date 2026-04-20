import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', slug: '', platform: 'TryHackMe', difficulty: 'Easy', category: 'Web', excerpt: '', content: '', tags: '', points: 0, published: false };

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function AdminCTF() {
  const [items,   setItems]   = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/ctf/admin/all').then((r) => setItems(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const startEdit = (c) => {
    setEditing(c._id);
    setForm({ ...c, tags: (c.tags || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      slug:   form.slug ? form.slug : slugify(form.title),
      tags:   form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      points: Number(form.points),
    };
    try {
      if (editing) { await api.put(`/ctf/${editing}`, payload); toast.success('Updated!'); }
      else         { await api.post('/ctf', payload);           toast.success('Created!'); }
      cancelEdit(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving writeup');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this writeup?')) return;
    try { await api.delete(`/ctf/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (c) => {
    try { await api.put(`/ctf/${c._id}`, { ...c, tags: c.tags, published: !c.published }); load(); }
    catch { toast.error('Update failed'); }
  };

  const diffColor = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400', Insane: 'text-purple-400' };

  return (
    <AdminLayout title="CTF Write-ups">
      {/* ── Form ── */}
      <div className="card mb-8">
        <h2 className="font-mono text-xs text-primary mb-6 tracking-widest">
          {editing ? '// EDIT WRITEUP' : '// NEW WRITEUP'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> title *</label>
              <input required type="text" value={form.title} onChange={set('title')} placeholder="Machine / Challenge name" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> slug (auto if blank)</label>
              <input type="text" value={form.slug} onChange={set('slug')} placeholder="auto-generated" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> platform *</label>
              <input required type="text" value={form.platform} onChange={set('platform')} placeholder="TryHackMe / HackTheBox..." className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> difficulty *</label>
              <select required value={form.difficulty} onChange={set('difficulty')} className="input">
                {['Easy', 'Medium', 'Hard', 'Insane'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> category *</label>
              <input required type="text" value={form.category} onChange={set('category')} placeholder="Web / Pwn / Crypto / Misc" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> points</label>
              <input type="number" min="0" value={form.points} onChange={set('points')} placeholder="0" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={set('tags')} placeholder="web, sqli, burpsuite, nmap" className="input" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={set('excerpt')} placeholder="Brief description of the challenge" className="input resize-none" />
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> writeup content (Markdown) *</label>
            <textarea
              required rows={14}
              value={form.content}
              onChange={set('content')}
              placeholder={"## Enumeration\n\n```bash\nnmap -sV -sC -oN nmap/initial 10.10.10.x\n```\n\n## Exploitation\n\n..."}
              className="input resize-y font-mono text-xs leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer w-fit">
            <input type="checkbox" checked={form.published} onChange={setCheck('published')} className="accent-primary w-3.5 h-3.5" />
            Publish immediately
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : editing ? 'Update Writeup' : 'Create Writeup'}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ── List ── */}
      <div className="card">
        <h2 className="font-mono text-xs text-primary mb-5 tracking-widest">// ALL WRITEUPS ({items.length})</h2>
        {items.length === 0 ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">No writeups yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-4 border border-border rounded hover:border-primary/30 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white truncate">{c.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="font-mono text-xs text-gray-600">{c.platform}</span>
                    <span className={`font-mono text-xs ${diffColor[c.difficulty] || 'text-gray-400'}`}>{c.difficulty}</span>
                    <span className="font-mono text-xs text-primary">{c.points}pts</span>
                    <span className={`font-mono text-xs ${c.published ? 'text-green-400' : 'text-yellow-500'}`}>
                      {c.published ? '● Published' : '○ Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => togglePublish(c)} className="p-2 text-gray-500 hover:text-primary rounded transition-colors">
                    {c.published ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                  <button onClick={() => startEdit(c)} className="p-2 text-gray-500 hover:text-primary rounded transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors">
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
