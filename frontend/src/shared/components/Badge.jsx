import { ESTADOS_ENVIO, ESTADOS_PEDIDO } from '@/shared/utils/constants';

export default function Badge({ estado, tipo = 'pedido' }) {
  const mapa = tipo === 'envio' ? ESTADOS_ENVIO : ESTADOS_PEDIDO;
  const info = mapa[estado] || { label: estado, tone: 'info' };
  return (
    <span className={`badge ${info.tone === 'danger' ? 'badge--danger' : info.tone === 'success' ? 'badge--success' : ''}`}>
      {info.label}
    </span>
  );
}
