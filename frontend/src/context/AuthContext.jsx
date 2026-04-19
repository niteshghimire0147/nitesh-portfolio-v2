import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify session via httpOnly cookie (no localStorage)
  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Step 1 login: returns { username } or { require2FA, tempToken }
  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.require2FA) return res.data; // caller handles 2FA step
    setUser({ username: res.data.username, twoFactorEnabled: res.data.twoFactorEnabled });
    return res.data;
  };

  // Step 2 login: validate TOTP code using tempToken
  const verify2FA = async (tempToken, totpCode) => {
    const res = await api.post('/auth/2fa/validate', { tempToken, totpCode });
    setUser({ username: res.data.username, twoFactorEnabled: true });
    return res.data;
  };

  // Logout: server clears httpOnly cookie
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
