import { useState, useEffect } from 'react';
import { FiCheck, FiTrash2, FiClock, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminTestimonials() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/testimonials/admin/all')
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api.put(`/testimonials/${id}/approve`); toast.success('Approved!'); load(); }
    catch { toast.error('Failed to approve'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await api.delete(`/testimonials/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const pending  = items.filter((t) => !t.approved);
  const approved = items.filter((t) => t.approved);

  return (
    <AdminLayout title="Testimonials">
      {/* ── Pending ── */}
      {pending.length > 0 && (
        <div className="card mb-6 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-5">
            <FiClock size={14} className="text-yellow-400" />
            <h2 className="font-mono text-xs text-yellow-400 tracking-widest">
              // PENDING REVIEW ({pending.length})
            </h2>
          </div>
          <div className="space-y-4">
            {pending.map((t) => (
              <div key={t._id} className="p-4 border border-yellow-500/20 rounded bg-yellow-500/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-display text-sm font-bold text-white">{t.name}</span>
                      <span className="font-mono text-xs text-gray-500">
                        {t.role} @ {t.company}
                      </span>
                    </div>
                    <p className="font-body text-sm text-gray-400 italic leading-relaxed">
                      "{t.message}"
                    </p>
                    <p className="font-mono text-xs text-gray-700 mt-2">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => approve(t._id)}
                      title="Approve"
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded transition-colors"
                    >
                      <FiCheck size={16} />
                    </button>
                    <button
                      onClick={() => remove(t._id)}
                      title="Delete"
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approved ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <FiCheckCircle size={14} className="text-primary" />
          <h2 className="font-mono text-xs text-primary tracking-widest">
            // APPROVED ({approved.length})
          </h2>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10 animate-pulse">Loading...</p>
        ) : approved.length === 0 ? (
          <p className="font-mono text-sm text-gray-600 text-center py-10">
            No approved testimonials yet.
          </p>
        ) : (
          <div className="space-y-3">
            {approved.map((t) => (
              <div
                key={t._id}
                className="flex items-start justify-between gap-4 p-4 border border-border
                           rounded hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-xs font-bold text-primary flex-shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-display text-sm font-bold text-white">{t.name}</span>
                    <span className="font-mono text-xs text-gray-500">
                      {t.role} @ {t.company}
                    </span>
                  </div>
                  <p className="font-body text-sm text-gray-400 italic leading-relaxed mt-2">
                    "{t.message}"
                  </p>
                </div>
                <button
                  onClick={() => remove(t._id)}
                  title="Delete"
                  className="p-2 text-gray-600 hover:text-red-400 rounded transition-colors flex-shrink-0"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
