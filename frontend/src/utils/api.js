import axios from 'axios';
import { ADMIN } from '../config/adminPath';

const api = axios.create({
  baseURL:         '/api',
  timeout:         10000,
  withCredentials: true, // send httpOnly cookie automatically
});

// Prevent multiple simultaneous 401s from firing multiple redirects
let isRedirecting = false;

// Handle 401 globally — redirect to login, avoid loops
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const loginPath = `/${ADMIN}/login`;
    const isAuthMe  = err.config?.url?.includes('/auth/me');
    if (
      err.response?.status === 401 &&
      !isAuthMe &&
      !isRedirecting &&
      !window.location.pathname.includes(loginPath)
    ) {
      isRedirecting = true;
      window.location.href = loginPath;
    }
    return Promise.reject(err);
  }
);

export default api;
