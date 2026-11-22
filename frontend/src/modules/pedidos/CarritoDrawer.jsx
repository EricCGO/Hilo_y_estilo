import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Trash2, ShoppingCart } from '@/shared/icons';
import { useCarrito } from '@/shared/context/CarritoContext';
import { useAuth } from '@/app/AuthContext';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { money } from '@/shared/utils/money';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import './pedidos.css';

export default function CarritoDrawer() {
  const carrito = useCarrito();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    direccion_entrega: '', ciudad: 'Popayán', telefono_contacto: '', notas: '',
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    if (!isAuthenticated) {
      carrito.close();
      navigate('/login', { state: { from: '/catalogo' } });
      return;
    }
    setError('');
    setEnviando(true);
    try {
      const respuesta = await api.post(endpoints.pedidos, {
        items: carrito.items.map((item) => ({
          producto_id: item.productoId,
          cantidad: item.cantidad,
        })),
        ...datos,
      });
      carrito.vaciar();
      carrito.close();
      navigate(`/mis-pedidos/${respuesta.data.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${carrito.isOpen ? 'active' : ''}`}
        onClick={carrito.close}
        aria-hidden="true"
      />
      <aside className={`carrito-drawer ${carrito.isOpen ? 'open' : ''}`} aria-label="Carrito de compras">
        <div className="carrito-drawer__header">
          <h3 className="row"><ShoppingCart size={18} className="text-gold" /> Tu carrito</h3>
          <button className="icon-button" onClick={carrito.close} aria-label="Cerrar carrito"><X size={18} /></button>
        </div>

        <div className="carrito-drawer__body">
          {carrito.items.length === 0 ? (
            <p className="muted">Aún no has agregado insumos. Explora el catálogo para comenzar.</p>
          ) : (
            carrito.items.map((item) => (
              <div className="carrito-item" key={item.productoId}>
                <div>
                  <strong>{item.nombre}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                    {money(item.precio)} c/u
                  </p>
                </div>
                <div className="carrito-item__acciones">
                  <button onClick={() => carrito.cambiarCantidad(item.productoId, item.cantidad - 1)} aria-label="Disminuir">−</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => carrito.cambiarCantidad(item.productoId, item.cantidad + 1)} aria-label="Aumentar">+</button>
                  <button onClick={() => carrito.quitar(item.productoId)} aria-label="Quitar"><Trash2 size={13} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.items.length > 0 && (
          <div className="carrito-drawer__footer">
            <div className="carrito-drawer__total">
              <span>Total</span><strong className="text-gold">{money(carrito.total)}</strong>
            </div>
            <Input
              label="Dirección de entrega"
              name="direccion_entrega"
              required
              value={datos.direccion_entrega}
              onChange={(e) => setDatos({ ...datos, direccion_entrega: e.target.value })}
            />
            <Input
              label="Teléfono de contacto"
              name="telefono_contacto"
              required
              value={datos.telefono_contacto}
              onChange={(e) => setDatos({ ...datos, telefono_contacto: e.target.value })}
            />
            {error && <div className="error-box">{error}</div>}
            <Button onClick={confirmar} disabled={enviando}>
              {enviando ? 'Procesando…' : 'Confirmar pedido'}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
