import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ADMIN } from './config/adminPath';

import Navbar            from './components/Navbar';
import Footer            from './components/Footer';
import ProtectedRoute    from './components/ProtectedRoute';
import ErrorBoundary     from './components/ErrorBoundary';
import BackToTop         from './components/BackToTop';
import ScrollProgress    from './components/ScrollProgress';
import LoadingScreen     from './components/LoadingScreen';

import Home                 from './pages/Home';
import BlogList             from './pages/BlogList';
import BlogPost             from './pages/BlogPost';
import CTFList              from './pages/CTFList';
import CTFPost              from './pages/CTFPost';
import NotFound             from './pages/NotFound';
import SecurityDisclosure   from './pages/SecurityDisclosure';
import PGPKey               from './pages/PGPKey';

import AdminLogin        from './pages/admin/AdminLogin';
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminBlogs        from './pages/admin/AdminBlogs';
import AdminCTF          from './pages/admin/AdminCTF';
import AdminProjects     from './pages/admin/AdminProjects';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminSiteConfig   from './pages/admin/AdminSiteConfig';
import AdminSettings     from './pages/admin/AdminSettings';

const toastStyle = {
  style: {
    background: '#0d1526',
    color: '#00d4ff',
    border: '1px solid #00d4ff44',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '13px',
  },
};

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(
    () => sessionStorage.getItem('_loaded') === '1'
  );

  const handleDone = () => {
    sessionStorage.setItem('_loaded', '1');
    setLoaded(true);
  };

  return (
    <AuthProvider>
      {!loaded && <LoadingScreen onDone={handleDone} />}
      <BrowserRouter>
        <ScrollProgress />
        <BackToTop />
        <Toaster position="top-right" toastOptions={toastStyle} />
        <div className="scanline" aria-hidden="true" />

        <Routes>
          {/* ── Public ── */}
          <Route path="/"                    element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/blog"                element={<PublicLayout><BlogList /></PublicLayout>} />
          <Route path="/blog/:slug"          element={<PublicLayout><BlogPost /></PublicLayout>} />
          <Route path="/ctf"                 element={<PublicLayout><CTFList /></PublicLayout>} />
          <Route path="/ctf/:slug"           element={<PublicLayout><CTFPost /></PublicLayout>} />
          <Route path="/security-disclosure" element={<PublicLayout><SecurityDisclosure /></PublicLayout>} />
          <Route path="/pgp"                 element={<PublicLayout><PGPKey /></PublicLayout>} />

          {/* ── Admin (obscured path via VITE_RP) ── */}
          <Route path={`/${ADMIN}/login`}        element={<AdminLogin />} />
          <Route path={`/${ADMIN}`}              element={<ProtectedRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/site-config`}  element={<ProtectedRoute><ErrorBoundary><AdminSiteConfig /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/blogs`}        element={<ProtectedRoute><ErrorBoundary><AdminBlogs /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/ctf`}          element={<ProtectedRoute><ErrorBoundary><AdminCTF /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/projects`}     element={<ProtectedRoute><ErrorBoundary><AdminProjects /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/testimonials`} element={<ProtectedRoute><ErrorBoundary><AdminTestimonials /></ErrorBoundary></ProtectedRoute>} />
          <Route path={`/${ADMIN}/settings`}     element={<ProtectedRoute><ErrorBoundary><AdminSettings /></ErrorBoundary></ProtectedRoute>} />

          {/* ── 404 catch-all ── */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
