import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiLoader } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', slug: '', platform: 'TryHackMe', difficulty: 'Easy',
  category: 'Web', excerpt: '', content: '', tags: '', points: 0, published: false,
};

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function AdminCTF() {
  const [items,       setItems]       = useState([]);
  const [form,        setForm]        = useState(EMPTY);
  const [editing,     setEditing]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [imgUploading,setImgUploading]= useState(false);
  const [isDragging,  setIsDragging]  = useState(false);

  const contentRef   = useRef(null);
  const imgInputRef  = useRef(null);
  const dragCountRef = useRef(0); // nested dragenter/dragleave counter — prevents flicker

  const load = () =>
    api.get('/ctf/admin/all')
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const set      = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const startEdit = (c) => {
    setEditing(c._id);
    setForm({ ...c, tags: (c.tags || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY); };

  // ── Shared image upload logic (used by button click AND drag-drop) ───────────

  const uploadImageFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(ext)) {
      toast.error('Only PNG and JPG images are allowed.');
      return;
    }

    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      // Insert ![image](url) at the current cursor position in the textarea
      const ta     = contentRef.current;
      const start  = ta ? ta.selectionStart : form.content.length;
      const end    = ta ? ta.selectionEnd   : form.content.length;
      const before = form.content.slice(0, start);
      const after  = form.content.slice(end);
      const mdSnip = `![image](${data.url})`;

      setForm((f) => ({ ...f, content: before + mdSnip + after }));

      requestAnimationFrame(() => {
        if (ta) {
          ta.focus();
          const pos = start + mdSnip.length;
          ta.setSelectionRange(pos, pos);
        }
      });

      toast.success('Image uploaded & inserted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setImgUploading(false);
    }
  };

  // ── Button click ─────────────────────────────────────────────────────────────

  const handleImgButtonClick = () => {
    if (imgUploading) return;
    imgInputRef.current?.click();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so the same file can be re-selected
    uploadImageFile(file);
  };

  // ── Drag-and-drop handlers ───────────────────────────────────────────────────

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    if (dragCountRef.current === 1) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragging(false);
    if (imgUploading) return;
    uploadImageFile(e.dataTransfer.files?.[0]);
  };

  // ── Form submit ──────────────────────────────────────────────────────────────

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
      if (editing) {
        await api.put(`/ctf/${editing}`, payload);
        toast.success('Updated!');
      } else {
        await api.post('/ctf', payload);
        toast.success('Created!');
      }
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
    try {
      await api.put(`/ctf/${c._id}`, { ...c, tags: c.tags, published: !c.published });
      load();
    } catch { toast.error('Update failed'); }
  };

  const diffColor = {
    Easy: 'text-green-400', Medium: 'text-yellow-400',
    Hard: 'text-red-400',   Insane: 'text-purple-400',
  };

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
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> title *
              </label>
              <input
                required type="text" value={form.title}
                onChange={set('title')} placeholder="Machine / Challenge name"
                className="input"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> slug (auto if blank)
              </label>
              <input
                type="text" value={form.slug}
                onChange={set('slug')} placeholder="auto-generated"
                className="input"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> platform *
              </label>
              <input
                required type="text" value={form.platform}
                onChange={set('platform')} placeholder="TryHackMe / HackTheBox..."
                className="input"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> difficulty *
              </label>
              <select required value={form.difficulty} onChange={set('difficulty')} className="input">
                {['Easy', 'Medium', 'Hard', 'Insane'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> category *
              </label>
              <input
                required type="text" value={form.category}
                onChange={set('category')} placeholder="Web / Pwn / Crypto / Misc"
                className="input"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> points
              </label>
              <input
                type="number" min="0" value={form.points}
                onChange={set('points')} placeholder="0"
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-gray-500 mb-1.5">
                <span className="text-primary">$</span> tags (comma-separated)
              </label>
              <input
                type="text" value={form.tags}
                onChange={set('tags')} placeholder="web, sqli, burpsuite, nmap"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-gray-500 mb-1.5">
              <span className="text-primary">$</span> excerpt *
            </label>
            <textarea
              required rows={2} value={form.excerpt}
              onChange={set('excerpt')} placeholder="Brief description of the challenge"
              className="input resize-none"
            />
          </div>

          {/* ── Writeup content with image upload + drag-and-drop ── */}
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs text-gray-500">
                <span className="text-primary">$</span> writeup content (Markdown) *
              </label>

              {/* Hidden file picker — PNG / JPG only */}
              <input
                ref={imgInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {/* Insert image button */}
              <button
                type="button"
                onClick={handleImgButtonClick}
                disabled={imgUploading}
                title="Upload PNG / JPG and insert into writeup"
                className="
                  flex items-center gap-1.5 px-2.5 py-1
                  font-mono text-xs rounded border
                  border-primary/40 text-primary
                  hover:bg-primary/10 hover:border-primary
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                {imgUploading ? (
                  <>
                    <FiLoader size={12} className="animate-spin" />
                    <span>uploading…</span>
                  </>
                ) : (
                  <>
                    <FiImage size={12} />
                    <span>insert image</span>
                  </>
                )}
              </button>
            </div>

            {/* Drop zone wrapper */}
            <div
              className="relative"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <textarea
                ref={contentRef}
                required
                rows={14}
                value={form.content}
                onChange={set('content')}
                placeholder={"## Enumeration\n\n```bash\nnmap -sV -sC -oN nmap/initial 10.10.10.x\n```\n\n## Exploitation\n\n..."}
                className={`input resize-y font-mono text-xs leading-relaxed w-full transition-colors duration-150${
                  isDragging ? ' border-primary ring-1 ring-primary/40' : ''
                }`}
              />

              {/* Drag-over overlay */}
              {isDragging && (
                <div className="
                  absolute inset-0 z-10 rounded
                  flex flex-col items-center justify-center gap-2
                  pointer-events-none
                  bg-black/60 backdrop-blur-[2px]
                  border-2 border-dashed border-primary
                ">
                  <FiImage size={30} className="text-primary" />
                  <p className="font-mono text-xs text-primary tracking-widest">
                    drop to upload &amp; insert
                  </p>
                </div>
              )}
            </div>

            <p className="mt-1 font-mono text-xs text-gray-600">
              PNG &amp; JPG only · max 5 MB ·
              click <span className="text-primary">insert image</span> or{' '}
              <span className="text-primary">drag &amp; drop</span> onto the editor to embed
            </p>
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-gray-400 cursor-pointer w-fit">
            <input
              type="checkbox" checked={form.published}
              onChange={setCheck('published')}
              className="accent-primary w-3.5 h-3.5"
            />
            Publish immediately
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Saving...' : editing ? 'Update Writeup' : 'Create Writeup'}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* ── List ── */}
      <div className="card">
        <h2 className="font-mono text-xs text-primary mb-5 tracking-widest">
          // ALL WRITEUPS ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">No writeups yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-4 border border-border rounded hover:border-primary/30 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white truncate">{c.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="font-mono text-xs text-gray-600">{c.platform}</span>
                    <span className={`font-mono text-xs ${diffColor[c.difficulty] || 'text-gray-400'}`}>
                      {c.difficulty}
                    </span>
                    <span className="font-mono text-xs text-primary">{c.points}pts</span>
                    <span className={`font-mono text-xs ${c.published ? 'text-green-400' : 'text-yellow-500'}`}>
                      {c.published ? '● Published' : '○ Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(c)}
                    className="p-2 text-gray-500 hover:text-primary rounded transition-colors"
                    title={c.published ? 'Unpublish' : 'Publish'}
                  >
                    {c.published ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 text-gray-500 hover:text-primary rounded transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors"
                    title="Delete"
                  >
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
