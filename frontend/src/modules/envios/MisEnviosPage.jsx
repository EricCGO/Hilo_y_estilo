import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { useCallback } from 'react';
import Spinner from '@/shared/components/Spinner';
import EmptyState from '@/shared/components/EmptyState';
import SeguimientoEnvio from './SeguimientoEnvio';
import './envios.css';

export default function MisEnviosPage() {
  const cargar = useCallback(() => api.get(endpoints.envios), []);
  const { data, loading, error } = useAsync(cargar, [cargar]);
  const envios = data?.data || [];

  if (loading) return <Spinner label="Cargando envíos…" />;

  return (
    <div className="container section">
      <span className="eyebrow">Logística</span>
      <h2 className="section-title">Mis envíos</h2>
      {error && <div className="error-box">{error.message}</div>}
      {!error && (envios.length ? (
        <div className="grid grid-3">
          {envios.map((envio) => (
            <div className="card" key={envio.id}>
              <h3 style={{ marginBottom: '0.4rem' }}>Pedido #{envio.pedido_id}</h3>
              <p className="muted" style={{ fontSize: '0.82rem', margin: 0 }}>
                {envio.transportadora}
              </p>
              <SeguimientoEnvio envio={envio} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin envíos activos"
          message="Cuando uno de tus pedidos sea despachado podrás seguirlo aquí."
        />
      ))}
    </div>
  );
}
