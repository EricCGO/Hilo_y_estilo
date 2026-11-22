import { ESTADOS_ENVIO } from '@/shared/utils/constants';
import { dateTime, dateOnly } from '@/shared/utils/dates';
import './envios.css';

const ORDEN = ['pendiente', 'preparando', 'en_transito', 'entregado'];

export default function SeguimientoEnvio({ envio }) {
  const indiceActual = ORDEN.indexOf(envio.estado);
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="badge">{ESTADOS_ENVIO[envio.estado] || envio.estado}</span>
        {envio.numero_guia && <span className="envio-guia">Guía: {envio.numero_guia}</span>}
      </div>
      <ul className="envio-timeline">
        {ORDEN.map((estado, indice) => (
          <li key={estado} className={indice <= indiceActual ? 'activo' : ''}>
            {ESTADOS_ENVIO[estado]}
            {estado === 'pendiente' && envio.created_at && (
              <span className="muted"> · {dateTime(envio.created_at)}</span>
            )}
            {estado === 'en_transito' && envio.fecha_estimada && (
              <span className="muted"> · Estimada {dateOnly(envio.fecha_estimada)}</span>
            )}
            {estado === 'entregado' && envio.fecha_entrega && (
              <span className="muted"> · {dateTime(envio.fecha_entrega)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
