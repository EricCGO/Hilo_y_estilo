import { NavLink, Link } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Home, Boxes, Users, X,
} from '@/shared/icons';
import { ROLES, ROLES_LABELS } from '@/shared/utils/constants';

/** Cada módulo declara qué roles pueden verlo. El filtro es único: aquí. */
const ITEMS = [
  {
    to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true,
    roles: [ROLES.ADMIN, ROLES.INVENTARIO, ROLES.LOGISTICA, ROLES.VENTAS],
  },
  {
    to: '/admin/productos', label: 'Productos e inventario', icon: Package,
    roles: [ROLES.ADMIN, ROLES.INVENTARIO],
  },
  {
    to: '/admin/categorias', label: 'Categorías', icon: Boxes,
    roles: [ROLES.ADMIN, ROLES.INVENTARIO],
  },
  {
    to: '/admin/ventas', label: 'Ventas y pedidos', icon: ShoppingCart,
    roles: [ROLES.ADMIN, ROLES.VENTAS],
  },
  {
    to: '/admin/envios', label: 'Envíos y guías', icon: Truck,
    roles: [ROLES.ADMIN, ROLES.LOGISTICA],
  },
  {
    to: '/admin/usuarios', label: 'Usuarios y empleados', icon: Users,
    roles: [ROLES.ADMIN],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const rol = user?.rol;
  const visibles = ITEMS.filter((item) => item.roles.includes(rol));

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} aria-label="Navegación administrativa">
      <div className="admin-sidebar__header">
        <div className="admin-sidebar__brand">HILO & ESTILO · ADMIN</div>
        <button
          className="icon-button admin-sidebar__close"
          onClick={onClose}
          aria-label="Cerrar menú administrativo"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="admin-nav" aria-label="Módulos disponibles">
        {visibles.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={onClose}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <span className="badge">{ROLES_LABELS[rol] || rol}</span>
        <Link to="/" className="row muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
          <Home size={16} /> Ver tienda pública
        </Link>
      </div>
    </aside>
  );
}
