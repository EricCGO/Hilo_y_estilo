import { useCallback } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Spinner from '@/shared/components/Spinner';
import { money } from '@/shared/utils/money';
import './admin.css';

export default function DashboardPage() {
  const cargar = useCallback(() => api.get(endpoints.adminDashboard), []);
  const { data, loading, error } = useAsync(cargar, [cargar]);
  const metricas = data?.data;

  return (
    <div>
      <header className="admin-page-header">
        <h2>Dashboard</h2>
        <p>Resumen de la operación textil del mes.</p>
      </header>
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}
      {metricas && (
        <div className="metricas">
          <div className="metrica"><span>Ventas del mes</span><strong>{metricas.ventas_mes}</strong></div>
          <div className="metrica"><span>Ingresos del mes</span><strong>{money(metricas.ingresos_mes)}</strong></div>
          <div className="metrica"><span>Pedidos pendientes</span><strong>{metricas.pedidos_pendientes}</strong></div>
          <div className="metrica"><span>Stock bajo</span><strong>{metricas.stock_bajo}</strong></div>
          <div className="metrica"><span>Productos activos</span><strong>{metricas.total_productos}</strong></div>
        </div>
      )}
    </div>
  );
}
