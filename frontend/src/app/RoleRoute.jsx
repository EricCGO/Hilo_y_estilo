import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';
import Spinner from '@/shared/components/Spinner';

/** Puerta por rol dentro de /admin: evita acceder por URL directa a módulos ajenos. */
export default function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Verificando permisos…" />;
  if (!roles.includes(user?.rol)) return <Navigate to="/admin" replace />;
  return children;
}
