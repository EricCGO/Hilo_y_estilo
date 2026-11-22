import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';
import Spinner from '@/shared/components/Spinner';
import { ROLES_OPERATIVOS } from '@/shared/utils/constants';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Verificando permisos…" />;
  if (!ROLES_OPERATIVOS.includes(user?.rol)) {
    return <Navigate to="/cuenta" replace />;
  }
  return children;
}
