import { Link } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import { ShoppingBag, Truck, LayoutDashboard } from '@/shared/icons';
import PerfilForm from './PerfilForm';
import './cuenta.css';

export default function CuentaPage() {
  const { user, isOperativo } = useAuth();

  return (
    <div className="container section">
      <span className="eyebrow">Mi espacio</span>
      <h2 className="section-title">Hola, {user?.nombre || user?.email}</h2>

      <div className="perfil-grid">
        <div className="card perfil-resumen">
          <div className="row"><span>Correo</span><strong>{user?.email}</strong></div>
          <div className="row"><span>Rol</span><span className="badge">{user?.rol}</span></div>
          <div className="row"><span>Ciudad</span><strong>{user?.ciudad || 'Popayán'}</strong></div>
          <div className="stack" style={{ marginTop: '1rem' }}>
            <Link to="/mis-pedidos" className="btn btn--outline"><ShoppingBag size={15} /> Mis pedidos</Link>
            <Link to="/envios" className="btn btn--outline"><Truck size={15} /> Mis envíos</Link>
            {isOperativo && (
              <Link to="/admin" className="btn btn--primary"><LayoutDashboard size={15} /> Panel administrativo</Link>
            )}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Datos del perfil</h3>
          <PerfilForm usuario={user} />
        </div>
      </div>
    </div>
  );
}
