import { useCallback, useState } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Badge from '@/shared/components/Badge';
import Spinner from '@/shared/components/Spinner';
import { TRANSICIONES_PEDIDO } from '@/shared/utils/constants';
import { dateTime } from '@/shared/utils/dates';
import { money } from '@/shared/utils/money';
import './admin.css';

export default function VentasAdminPage() {
  const cargar = useCallback(() => api.get(endpoints.adminPedidos, { params: { limit: 100 } }), []);
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cambiarEstado = async (pedido, estado) => {
    setMensaje('');
    try {
      await api.patch(endpoints.adminPedidoEstado(pedido.id), { estado });
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const pedidos = (data?.data || []).filter(
    (pedido) => !filtro || pedido.estado === filtro
  );

  return (
    <div>
      <header className="admin-page-header">
        <h2>Ventas y pedidos</h2>
        <p>Gestiona el estado de cada pedido y su progreso.</p>
      </header>

      <div className="admin-toolbar">
        <select
          className="estado-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.keys(TRANSICIONES_PEDIDO).map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      {mensaje && <div className="error-box">{mensaje}</div>}
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td><strong>#{pedido.id}</strong></td>
                  <td>{pedido.usuario_email}</td>
                  <td>{dateTime(pedido.created_at)}</td>
                  <td>{money(pedido.total)}</td>
                  <td><Badge estado={pedido.estado} /></td>
                  <td>
                    {(TRANSICIONES_PEDIDO[pedido.estado] || []).length > 0 && (
                      <select
                        className="estado-select"
                        value=""
                        onChange={(e) => cambiarEstado(pedido, e.target.value)}
                        aria-label={`Cambiar estado del pedido ${pedido.id}`}
                      >
                        <option value="">Cambiar a…</option>
                        {TRANSICIONES_PEDIDO[pedido.estado].map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
