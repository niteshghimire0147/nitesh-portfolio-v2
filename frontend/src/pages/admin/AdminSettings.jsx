import { useState, useEffect } from 'react';
import { FiShield, FiSmartphone, FiKey, FiCheck, FiX } from 'react-icons/fi';
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

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => {});
  }, []);

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

  return (
    <AdminLayout title="Security Settings">
      <div className="max-w-xl space-y-6">

        {/* 2FA Status card */}
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

          {/* ── Setup: show QR code ── */}
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

          {/* ── Disable: confirm TOTP ── */}
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
            <p><span className="text-primary">→</span> Security alerts sent to {' '}
              <span className="text-gray-400">{import.meta.env.VITE_ALERT_EMAIL || 'your email'}</span>
            </p>
            <p><span className="text-green-400">✓</span> 0 npm vulnerabilities (audited)</p>
          </div>
        </div>

        {/* Key info */}
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
