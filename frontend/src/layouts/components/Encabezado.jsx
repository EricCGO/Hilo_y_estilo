import { NavLink, Link, useNavigate } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import { useCarrito } from '@/shared/context/CarritoContext';
import {
  Menu, Search, ShoppingBag, User, LogOut, LayoutDashboard,
} from '@/shared/icons';

const ENLACES = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo de insumos' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/registro', label: 'Únete al taller' },
];

export default function Encabezado({ onOpenSidebar }) {
  const { isAuthenticated, isOperativo, user, logout } = useAuth();
  const carrito = useCarrito();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__top">
        <button
          className="icon-button menu-trigger"
          onClick={onOpenSidebar}
          aria-label="Abrir menú de categorías"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="brand-mark" aria-hidden="true" tabIndex={-1}>
          <span className="brand-mark__circle">HE</span>
          <span>HILO & ESTILO</span>
        </Link>

        <div className="brand-title">
          <h1>HILO <span>&</span> ESTILO</h1>
          <p>COSIENDO TU DESTINO</p>
        </div>

        <div className="header-actions">
          <Link to="/catalogo" className="icon-button" aria-label="Buscar insumos">
            <Search size={18} />
          </Link>
          <button
            className="icon-button"
            onClick={carrito.open}
            aria-label={`Abrir carrito (${carrito.count} productos)`}
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={18} />
            {carrito.count > 0 && <span className="carrito-contador">{carrito.count}</span>}
          </button>
          {isAuthenticated ? (
            <>
              {isOperativo && (
                <Link to="/admin" className="icon-button" aria-label="Panel administrativo">
                  <LayoutDashboard size={18} />
                </Link>
              )}
              <Link to="/cuenta" className="icon-button" aria-label={`Hola, ${user?.nombre || 'usuario'}`}>
                <User size={18} />
              </Link>
              <button className="icon-button" onClick={cerrarSesion} aria-label="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="icon-button" aria-label="Iniciar sesión">
              <User size={18} />
            </Link>
          )}
        </div>
      </div>

      <nav className="nav-pills" aria-label="Navegación principal">
        <div className="nav-pills__inner">
          {ENLACES.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <>
              <NavLink to="/mis-pedidos" className={({ isActive }) => (isActive ? 'active' : '')}>
                Mis pedidos
              </NavLink>
              <NavLink to="/envios" className={({ isActive }) => (isActive ? 'active' : '')}>
                Envíos
              </NavLink>
            </>
          )}
          {isOperativo && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Administración
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
