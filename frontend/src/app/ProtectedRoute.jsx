import { Navigate, useLocation } from 'react-router';
import { useAuth } from './AuthContext';
import Spinner from '@/shared/components/Spinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Verificando sesión…" />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
