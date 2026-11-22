import { Link } from 'react-router';
import { ArrowRight, PackageX } from '@/shared/icons';
import Badge from '@/shared/components/Badge';
import { money } from '@/shared/utils/money';

export default function ProductoCard({ producto }) {
  return (
    <article className="producto-card">
      <div className="producto-card__imagen">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} />
        ) : (
          <span aria-hidden="true">🧵</span>
        )}
        <div className="producto-card__badges">
          <Badge estado={producto.categoria_nombre || 'Insumo'} />
          {producto.agotado && <Badge estado="cancelado" />}
        </div>
      </div>
      <div className="producto-card__cuerpo">
        <h4>{producto.nombre}</h4>
        <p>{producto.descripcion || 'Insumo de alta calidad para tu taller.'}</p>
        <div className="producto-card__pie">
          <strong className="text-gold">{money(producto.precio)}</strong>
          <span className="muted" style={{ fontSize: '0.75rem' }}>
            {producto.agotado ? <><PackageX size={13} /> Agotado</> : `${producto.stock} disponibles`}
          </span>
        </div>
        <Link to={`/catalogo/${producto.slug}`} className="btn btn--outline btn--sm">
          Ver detalle <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
