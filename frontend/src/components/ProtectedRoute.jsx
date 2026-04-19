import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ADMIN } from '../config/adminPath';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="font-mono text-primary text-sm animate-pulse">
          <span className="text-gray-600">$ </span>
          authenticating
          <span className="cursor-blink" />
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to={`/${ADMIN}/login`} replace />;
}
