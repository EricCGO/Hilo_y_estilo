import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePedido } from './usePedidos';
import { useAuth } from '@/app/AuthContext';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Badge from '@/shared/components/Badge';
import Button from '@/shared/components/Button';
import Spinner from '@/shared/components/Spinner';
import { ArrowLeft, AlertCircle as ErrorIcon } from 'lucide-react';
import { dateTime } from '@/shared/utils/dates';
import { money } from '@/shared/utils/money';
import './pedidos.css';

export default function PedidoDetallePage() {
  const { id } = useParams();
  const { pedido, loading, error, reload } = usePedido(id);
  const { isOperativo } = useAuth();
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  if (loading) return <Spinner label="Cargando pedido…" />;
  if (error || !pedido) {
    return (
      <div className="container section center">
        <h2>Pedido no encontrado</h2>
        <Link to="/mis-pedidos" className="btn btn--outline">Volver</Link>
      </div>
    );
  }

  const cancelar = async () => {
    setProcesando(true);
    setMensaje('');
    try {
      await api.post(endpoints.cancelarPedido(pedido.id));
      reload();
      setMensaje('Pedido cancelado y stock reintegrado.');
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="container section">
      <Link to="/mis-pedidos" className="row muted" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Mis pedidos
      </Link>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Pedido #{pedido.id}</h2>
        <Badge estado={pedido.estado} />
      </div>

      <div className="detalle-pedido">
        <div className="card">
          <h3>Ítems</h3>
          {pedido.items.map((item) => (
            <div className="linea-item" key={item.id}>
              <div>
                <strong>{item.nombre_producto}</strong>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {item.cantidad} × {money(item.precio_unitario)}
                </div>
              </div>
              <strong>{money(item.subtotal)}</strong>
            </div>
          ))}
          <div className="linea-item" style={{ marginTop: '1rem' }}>
            <strong>Total</strong><strong className="text-gold">{money(pedido.total)}</strong>
          </div>
        </div>

        <div className="card stack">
          <h3>Entrega</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>{pedido.direccion_entrega}</p>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>{pedido.ciudad}</p>
          <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            {dateTime(pedido.created_at)}
          </p>
          {mensaje && <div className="error-box">{mensaje}</div>}
          {!isOperativo && ['pendiente', 'confirmado'].includes(pedido.estado) && (
            <Button variant="danger" onClick={cancelar} disabled={procesando}>
              <ErrorIcon size={15} /> Cancelar pedido
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
