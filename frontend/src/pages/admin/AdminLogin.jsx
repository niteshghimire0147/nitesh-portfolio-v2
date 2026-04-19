import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShield, FiEye, FiEyeOff, FiSmartphone } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ADMIN } from '../../config/adminPath';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form,      setForm]      = useState({ username: '', password: '' });
  const [totpCode,  setTotpCode]  = useState('');
  const [tempToken, setTempToken] = useState('');
  const [step,      setStep]      = useState(1); // 1 = credentials, 2 = TOTP
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  // Wipe tempToken from memory when component unmounts (e.g. tab switch mid-2FA)
  useEffect(() => () => setTempToken(''), []);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.username, form.password);
      if (result.require2FA) {
        setTempToken(result.tempToken);
        setStep(2);
        toast('Enter your authenticator code.', { icon: '🔐' });
      } else {
        toast.success('Access granted.');
        navigate(`/${ADMIN}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2FA(tempToken, totpCode);
      toast.success('Access granted.');
      navigate(`/${ADMIN}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid authenticator code');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center px-6 cyber-grid">
      <div className="scanline" aria-hidden="true" />

      <div className="w-full max-w-md">
        <div className="glow-border rounded-lg overflow-hidden">
          {/* Terminal bar */}
          <div className="bg-card px-4 py-3 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 font-mono text-xs text-gray-500">
              admin@nitesh:~$ <span className="text-primary">
                {step === 1 ? 'sudo login' : '2fa --verify'}
              </span>
            </span>
          </div>

          <div className="p-8 bg-dark">
            <div className="text-center mb-8">
              <div className="inline-flex w-16 h-16 border border-primary/30 items-center justify-center rounded mb-4 bg-primary/5">
                {step === 1
                  ? <FiShield size={30} className="text-primary" />
                  : <FiSmartphone size={30} className="text-primary" />
                }
              </div>
              <h1 className="font-display text-lg font-bold text-primary tracking-widest">
                {step === 1 ? 'CMS ACCESS' : '2FA VERIFY'}
              </h1>
              <p className="font-mono text-xs text-gray-600 mt-1">
                {step === 1 ? 'Authentication Required' : 'Enter your authenticator code'}
              </p>
            </div>

            {/* ── Step 1: Credentials ── */}
            {step === 1 && (
              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-2">
                    <span className="text-primary">$</span> username
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="admin"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-2">
                    <span className="text-primary">$</span> password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? '> authenticating...' : '> sudo ./login.sh'}
                </button>
              </form>
            )}

            {/* ── Step 2: TOTP ── */}
            {step === 2 && (
              <form onSubmit={handle2FA} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs text-gray-500 mb-2">
                    <span className="text-primary">$</span> authenticator code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9 ]*"
                    maxLength={7}
                    autoFocus
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000 000"
                    className="input text-center text-xl tracking-widest"
                  />
                  <p className="font-mono text-xs text-gray-600 mt-2 text-center">
                    Open Google Authenticator / Authy
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? '> verifying...' : '> ./verify_totp.sh'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setTotpCode(''); setTempToken(''); }}
                  className="w-full font-mono text-xs text-gray-600 hover:text-primary transition-colors"
                >
                  ← Back to login
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/" className="font-mono text-xs text-gray-600 hover:text-primary transition-colors">
                ← Back to portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
