import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPaperclip, FiX, FiDownload } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', slug: '', excerpt: '', content: '', tags: '', category: 'General', published: false, pdfUrl: '' };

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function AdminBlogs() {
  const [blogs,       setBlogs]       = useState([]);
  const [form,        setForm]        = useState(EMPTY);
  const [editing,     setEditing]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [pdfFile,     setPdfFile]     = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => api.get('/blogs/admin/all').then((r) => setBlogs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const startEdit = (b) => {
    setEditing(b._id);
    setForm({ ...b, tags: (b.tags || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditing(null); setForm(EMPTY); setPdfFile(null); };

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be under 10 MB.');
      return;
    }
    setPdfFile(file);
  };

  const removePdf = () => {
    setPdfFile(null);
    setForm((f) => ({ ...f, pdfUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalPdfUrl = form.pdfUrl;

      if (pdfFile) {
        setPdfUploading(true);
        const fd = new FormData();
        fd.append('pdf', pdfFile);
        const r = await api.post('/upload/pdf', fd);
        finalPdfUrl = r.data.url;
        setPdfUploading(false);
      }

      const payload = {
        ...form,
        pdfUrl: finalPdfUrl,
        slug: form.slug ? form.slug : slugify(form.title),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editing) {
        await api.put(`/blogs/${editing}`, payload);
        toast.success('Post updated!');
      } else {
        await api.post('/blogs', payload);
        toast.success('Post created!');
      }
      cancelEdit();
      load();
    } catch (err) {
      setPdfUploading(false);
      toast.error(err.response?.data?.message || 'Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Post deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (b) => {
    try {
      await api.put(`/blogs/${b._id}`, { ...b, tags: b.tags, published: !b.published });
      load();
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout title="Blog Posts">
      {/* ── Form ── */}
      <div className="card mb-8">
        <h2 className="font-mono text-xs text-primary mb-6 tracking-widest">
          {editing ? '// EDIT POST' : '// NEW POST'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> title *</label>
              <input required type="text" value={form.title} onChange={set('title')} placeholder="Post title" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> slug (auto if blank)</label>
              <input type="text" value={form.slug} onChange={set('slug')} placeholder="post-slug" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> category</label>
              <input type="text" value={form.category} onChange={set('category')} placeholder="General" className="input" />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={set('tags')} placeholder="pentest, web, ctf" className="input" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={set('excerpt')} placeholder="Short description shown in list view" className="input resize-none" />
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5"><span className="text-primary">$</span> content (Markdown) *</label>
            <textarea
              required rows={14}
              value={form.content}
              onChange={set('content')}
              placeholder={"# Title\n\n## Section\n\nWrite your post in **Markdown**...\n\n```bash\nnmap -sV target\n```"}
              className="input resize-y font-mono text-xs leading-relaxed"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5">
              <span className="text-primary">$</span> attach PDF (optional, max 10 MB)
            </label>
            {(form.pdfUrl && !pdfFile) ? (
              <div className="flex items-center gap-3 p-3 border border-border rounded bg-card">
                <FiPaperclip size={14} className="text-primary flex-shrink-0" />
                <a
                  href={form.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline truncate flex-1"
                >
                  {form.pdfUrl.split('/').pop()}
                </a>
                <button type="button" onClick={removePdf} className="text-gray-500 hover:text-red-400 transition-colors">
                  <FiX size={14} />
                </button>
              </div>
            ) : pdfFile ? (
              <div className="flex items-center gap-3 p-3 border border-primary/30 rounded bg-primary/5">
                <FiPaperclip size={14} className="text-primary flex-shrink-0" />
                <span className="font-mono text-xs text-gray-300 truncate flex-1">{pdfFile.name}</span>
                <span className="font-mono text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={removePdf} className="text-gray-500 hover:text-red-400 transition-colors">
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded cursor-pointer hover:border-primary/40 transition-colors w-fit">
                <FiPaperclip size={14} className="text-gray-500" />
                <span className="font-mono text-xs text-gray-500">Choose PDF file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer w-fit">
            <input type="checkbox" checked={form.published} onChange={setCheck('published')} className="accent-primary w-3.5 h-3.5" />
            Publish immediately
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || pdfUploading} className="btn-primary disabled:opacity-50">
              {pdfUploading ? 'Uploading PDF...' : loading ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── List ── */}
      <div className="card">
        <h2 className="font-mono text-xs text-primary mb-5 tracking-widest">
          // ALL POSTS ({blogs.length})
        </h2>
        {blogs.length === 0 ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">No posts yet. Create one above.</p>
        ) : (
          <div className="space-y-2">
            {blogs.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between p-4 border border-border rounded
                           hover:border-primary/30 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white truncate">{b.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="font-mono text-xs text-gray-600">{b.category}</span>
                    <span className="font-mono text-xs text-gray-600">👁 {b.views}</span>
                    <span className={`font-mono text-xs ${b.published ? 'text-green-400' : 'text-yellow-500'}`}>
                      {b.published ? '● Published' : '○ Draft'}
                    </span>
                    <span className="font-mono text-xs text-gray-700">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => togglePublish(b)} title={b.published ? 'Unpublish' : 'Publish'}
                    className="p-2 text-gray-500 hover:text-primary rounded transition-colors">
                    {b.published ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                  <button onClick={() => startEdit(b)} title="Edit"
                    className="p-2 text-gray-500 hover:text-primary rounded transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(b._id)} title="Delete"
                    className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors">
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
