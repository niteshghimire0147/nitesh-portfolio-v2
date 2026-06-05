import { useState, useEffect, useRef } from 'react';
import {
  FiShield, FiSmartphone, FiKey, FiCheck, FiX,
  FiFileText, FiUpload, FiTrash2, FiLoader, FiDownload,
} from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [user,        setUser]        = useState(null);
  const [step,        setStep]        = useState('idle'); // idle|setup|enable|disable
  const [qrDataUrl,   setQrDataUrl]   = useState('');
  const [manualKey,   setManualKey]   = useState('');
  const [totpInput,   setTotpInput]   = useState('');
  const [loading,     setLoading]     = useState(false);

  // Resume state
  const [resume,          setResume]          = useState({ url: '', filename: '' });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeRemoving,  setResumeRemoving]  = useState(false);
  const resumeInputRef = useRef(null);

  // Opaque download endpoint — never exposes UUID filename
  const downloadUrl = '/api/download/resume';

  const handleResumeDownload = async (e) => {
    e.preventDefault();
    if (!resume?.filename && !resume?.url) return;
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resume.filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => {});
    // Load current resume URL from SiteConfig
    api.get('/site-config').then(r => {
      if (r.data?.resume) {
        setResume(r.data.resume);
      }
    }).catch(() => {});
  }, []);

  // ── 2FA ──────────────────────────────────────────────────────────────────────

  const startSetup = async () => {
    setLoading(true);
    try {
      const r = await api.post('/auth/2fa/setup');
      setQrDataUrl(r.data.qrDataUrl);
      setManualKey(r.data.manualKey);
      setStep('setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/enable', { totpCode: totpInput });
      toast.success('2FA enabled successfully!');
      setUser(u => ({ ...u, twoFactorEnabled: true }));
      setStep('idle');
      setTotpInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setTotpInput('');
    } finally {
      setLoading(false);
    }
  };

  const confirmDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', { totpCode: totpInput });
      toast.success('2FA disabled.');
      setUser(u => ({ ...u, twoFactorEnabled: false }));
      setStep('idle');
      setTotpInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setTotpInput('');
    } finally {
      setLoading(false);
    }
  };

  // ── Resume ───────────────────────────────────────────────────────────────────

  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      toast.error('Only PDF files are allowed for resume.');
      return;
    }

    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const { data } = await api.post('/upload/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setResume({ url: data.url, filename: data.filename });
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeRemove = async () => {
    if (!window.confirm('Remove the current resume? This cannot be undone.')) return;
    setResumeRemoving(true);
    try {
      await api.delete('/upload/resume');
      setResume({ url: '', filename: '' });
      toast.success('Resume removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed.');
    } finally {
      setResumeRemoving(false);
    }
  };

  const hasResume = Boolean(resume?.filename || resume?.url);

  return (
    <AdminLayout title="Settings">
      <div className="max-w-xl space-y-6">

        {/* ── Resume Upload ── */}
        <div className="card">
          <h3 className="font-mono text-xs text-primary mb-5 tracking-widest flex items-center gap-2">
            <FiFileText size={12} /> // RESUME
          </h3>

          {hasResume ? (
            /* Current resume info */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded border border-green-400/20 bg-green-400/5">
                <div className="w-9 h-9 rounded border border-green-400/30 bg-green-400/10 flex items-center justify-center flex-shrink-0">
                  <FiFileText size={16} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-green-400">● Resume active</p>
                  <p className="font-mono text-xs text-gray-500 truncate mt-0.5">
                    {resume.filename}
                  </p>
                </div>
                {resumeApiUrl && (
                  <button
                    type="button"
                    onClick={handleResumeDownload}
                    className="p-2 text-gray-500 hover:text-primary rounded transition-colors flex-shrink-0"
                    title="Preview / Download"
                  >
                    <FiDownload size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {/* Replace button */}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading || resumeRemoving}
                  className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {resumeUploading ? (
                    <><FiLoader size={13} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><FiUpload size={13} /> Replace Resume</>
                  )}
                </button>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleResumeRemove}
                  disabled={resumeUploading || resumeRemoving}
                  className="
                    flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded border
                    border-red-400/30 text-red-400/70
                    hover:text-red-400 hover:border-red-400 hover:bg-red-400/5
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150
                  "
                >
                  {resumeRemoving ? (
                    <><FiLoader size={13} className="animate-spin" /> Removing…</>
                  ) : (
                    <><FiTrash2 size={13} /> Remove</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* No resume yet */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded border border-border bg-card">
                <div className="w-9 h-9 rounded border border-border flex items-center justify-center flex-shrink-0">
                  <FiFileText size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-500">○ No resume uploaded</p>
                  <p className="font-mono text-xs text-gray-600 mt-0.5">
                    Upload a PDF to make it downloadable on your portfolio
                  </p>
                </div>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleResumeFileChange}
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeUploading}
                className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {resumeUploading ? (
                  <><FiLoader size={13} className="animate-spin" /> Uploading…</>
                ) : (
                  <><FiUpload size={13} /> Upload Resume (PDF)</>
                )}
              </button>
            </div>
          )}

          <p className="mt-3 font-mono text-xs text-gray-600">
            PDF only · max 10 MB · replaces any existing resume automatically
          </p>
        </div>

        {/* ── 2FA Status card ── */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded border flex items-center justify-center flex-shrink-0 ${
                user?.twoFactorEnabled ? 'border-green-400/40 bg-green-400/10' : 'border-border bg-card'
              }`}>
                <FiSmartphone size={18} className={user?.twoFactorEnabled ? 'text-green-400' : 'text-gray-500'} />
              </div>
              <div>
                <h3 className="font-mono text-sm text-white">Two-Factor Authentication</h3>
                <p className="font-mono text-xs mt-0.5" style={{ color: user?.twoFactorEnabled ? '#00ff88' : '#6b7280' }}>
                  {user?.twoFactorEnabled ? '● Enabled — TOTP active' : '○ Disabled'}
                </p>
              </div>
            </div>

            {step === 'idle' && user && (
              user.twoFactorEnabled
                ? (
                  <button
                    onClick={() => { setStep('disable'); setTotpInput(''); }}
                    className="font-mono text-xs px-3 py-1.5 rounded border border-red-400/40 text-red-400/70 hover:text-red-400 hover:border-red-400 transition-all flex-shrink-0"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={startSetup}
                    disabled={loading}
                    className="btn-primary text-xs px-4 py-1.5 flex-shrink-0 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Enable 2FA'}
                  </button>
                )
            )}
          </div>

          {/* Setup: show QR code */}
          {step === 'setup' && (
            <div className="mt-6 pt-6 border-t border-border space-y-5">
              <div>
                <p className="font-mono text-xs text-primary mb-1 tracking-widest">// STEP 1: SCAN QR CODE</p>
                <p className="font-mono text-xs text-gray-500 mb-4">
                  Open <strong className="text-gray-300">Google Authenticator</strong> or <strong className="text-gray-300">Authy</strong> and scan the code below.
                </p>
                {qrDataUrl && (
                  <div className="flex justify-center">
                    <img src={qrDataUrl} alt="2FA QR Code" className="w-48 h-48 rounded border border-border" />
                  </div>
                )}
              </div>

              <div>
                <p className="font-mono text-xs text-gray-500 mb-2">Or enter this key manually:</p>
                <div className="bg-card border border-border rounded p-3 font-mono text-xs text-primary tracking-widest break-all select-all">
                  {manualKey}
                </div>
              </div>

              <form onSubmit={confirmEnable} className="space-y-3">
                <p className="font-mono text-xs text-primary tracking-widest">// STEP 2: VERIFY CODE</p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  autoFocus
                  required
                  value={totpInput}
                  onChange={e => setTotpInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="input text-center text-lg tracking-widest w-full"
                />
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                    <FiCheck size={14} className="mr-2" />
                    {loading ? 'Verifying...' : 'Confirm & Enable'}
                  </button>
                  <button type="button" onClick={() => { setStep('idle'); setTotpInput(''); }}
                    className="font-mono text-xs px-4 py-2 rounded border border-border text-gray-500 hover:text-gray-300 transition-all">
                    <FiX size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Disable: confirm TOTP */}
          {step === 'disable' && (
            <form onSubmit={confirmDisable} className="mt-6 pt-6 border-t border-border space-y-4">
              <p className="font-mono text-xs text-primary tracking-widest">// CONFIRM DISABLE</p>
              <p className="font-mono text-xs text-gray-500">Enter your current authenticator code to disable 2FA.</p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]*"
                maxLength={7}
                autoFocus
                required
                value={totpInput}
                onChange={e => setTotpInput(e.target.value)}
                placeholder="Enter 6-digit code"
                className="input text-center text-lg tracking-widest w-full"
              />
              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="flex-1 font-mono text-xs py-2 px-4 rounded border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Disable 2FA'}
                </button>
                <button type="button" onClick={() => { setStep('idle'); setTotpInput(''); }}
                  className="font-mono text-xs px-4 py-2 rounded border border-border text-gray-500 hover:text-gray-300 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security info */}
        <div className="card border-primary/10">
          <h3 className="font-mono text-xs text-primary mb-4 tracking-widest flex items-center gap-2">
            <FiShield size={12} /> // SECURITY_INFO
          </h3>
          <div className="space-y-2 font-mono text-xs text-gray-500 leading-relaxed">
            <p><span className="text-primary">→</span> Session: httpOnly cookie (XSS-resistant), 7-day expiry</p>
            <p><span className="text-primary">→</span> Login: rate-limited to 5 attempts per 15 minutes per IP</p>
            <p><span className="text-primary">→</span> IPs blocked after 3 path traversal attempts (24h)</p>
            <p><span className="text-primary">→</span> Security alerts sent to{' '}
              <span className="text-gray-400">{import.meta.env.VITE_ALERT_EMAIL || 'your email'}</span>
            </p>
            <p><span className="text-green-400">✓</span> 0 npm vulnerabilities (audited)</p>
          </div>
        </div>

        {/* Key / Account info */}
        <div className="card">
          <h3 className="font-mono text-xs text-primary mb-4 tracking-widest flex items-center gap-2">
            <FiKey size={12} /> // ACCOUNT
          </h3>
          <div className="font-mono text-xs text-gray-500">
            <p>Username: <span className="text-gray-300">{user?.username || '...'}</span></p>
            <p className="mt-2">2FA: <span className={user?.twoFactorEnabled ? 'text-green-400' : 'text-yellow-400'}>
              {user?.twoFactorEnabled ? 'ENABLED (TOTP)' : 'DISABLED'}
            </span></p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
