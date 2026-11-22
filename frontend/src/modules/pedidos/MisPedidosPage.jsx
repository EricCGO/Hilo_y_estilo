import { Link } from 'react-router';
import { usePedidos } from './usePedidos';
import Badge from '@/shared/components/Badge';
import Spinner from '@/shared/components/Spinner';
import EmptyState from '@/shared/components/EmptyState';
import Pagination from '@/shared/components/Pagination';
import { dateTime } from '@/shared/utils/dates';
import { money } from '@/shared/utils/money';
import { ChevronRight, AlertCircle } from '@/shared/icons';
import './pedidos.css';

export default function MisPedidosPage() {
  const { pedidos, meta, loading, error } = usePedidos();

  if (loading) return <Spinner label="Cargando pedidos…" />;

  return (
    <div className="container section">
      <span className="eyebrow">Historial de compras</span>
      <h2 className="section-title">Mis pedidos</h2>

      {error && <div className="error-box"><AlertCircle size={16} /> {error.message}</div>}

      {!error && (pedidos.length ? (
        <>
          <div className="stack">
            {pedidos.map((pedido) => (
              <Link key={pedido.id} to={`/mis-pedidos/${pedido.id}`} className="pedido-card">
                <div>
                  <h4>Pedido #{pedido.id}</h4>
                  <div className="pedido-card__meta">
                    {dateTime(pedido.created_at)} · {pedido.items.length} ítem(s)
                  </div>
                </div>
                <Badge estado={pedido.estado} />
                <strong className="pedido-card__total">{money(pedido.total)}</strong>
                <ChevronRight size={18} className="text-gold" />
              </Link>
            ))}
          </div>
          <Pagination meta={meta} onPage={() => {}} />
        </>
      ) : (
        <EmptyState
          title="Aún no tienes pedidos"
          message="Cuando realices tu primera compra aparecerá aquí."
        />
      ))}
    </div>
  );
}
