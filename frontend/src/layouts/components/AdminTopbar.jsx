import { useNavigate } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import { LogOut, User, Menu } from '@/shared/icons';
import { ROLES_LABELS } from '@/shared/utils/constants';

export default function AdminTopbar({ onOpenMenu, menuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const salir = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-topbar">
      <div className="row">
        <button
          className="icon-button admin-menu-trigger"
          onClick={onOpenMenu}
          aria-label="Abrir menú administrativo"
          aria-expanded={menuOpen}
        >
          <Menu size={20} />
        </button>
        <User size={18} className="text-gold" />
        <span>{user?.nombre || user?.email}</span>
        <span className="badge">{ROLES_LABELS[user?.rol] || user?.rol}</span>
      </div>
      <button className="btn btn--ghost btn--sm" onClick={salir}>
        <LogOut size={15} /> Cerrar sesión
      </button>
    </div>
  );
}
