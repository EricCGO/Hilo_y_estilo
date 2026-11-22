import { Link, useParams } from 'react-router';
import { CheckCircle2, ArrowLeft, PackageX } from '@/shared/icons';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { money } from '@/shared/utils/money';
import { useCarrito } from '@/shared/context/CarritoContext';
import { ShoppingCart } from '@/shared/icons';
import Spinner from '@/shared/components/Spinner';
import Badge from '@/shared/components/Badge';
import './catalogo.css';

export default function ProductoDetallePage() {
  const { slug } = useParams();
  const carrito = useCarrito();
  const { data, loading, error } = useAsync(
    () => api.get(endpoints.producto(slug)).then((respuesta) => respuesta.data),
    [slug]
  );

  if (loading) return <Spinner label="Cargando producto…" />;
  if (error || !data) {
    return (
      <div className="container section center">
        <h2>Producto no encontrado</h2>
        <Link to="/catalogo" className="btn btn--outline">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <Link to="/catalogo" className="row muted" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>
      <div className="detalle-grid">
        <div className="detalle-imagen">
          {data.imagen_url ? <img src={data.imagen_url} alt={data.nombre} /> : '🧵'}
        </div>
        <div className="detalle-info">
          <Badge estado={data.categoria_nombre || 'Insumo'} />
          <h2 style={{ marginTop: '0.75rem' }}>{data.nombre}</h2>
          <p>{data.descripcion || 'Insumo textil de alta calidad para talleres locales.'}</p>
          <div className="detalle-precio text-gold">{money(data.precio)}</div>
          <ul className="detalle-lista">
            <li><CheckCircle2 size={16} /> SKU: {data.sku}</li>
            <li>
              {data.agotado ? <PackageX size={16} /> : <CheckCircle2 size={16} />}
              {data.agotado ? 'Agotado temporalmente' : `${data.stock} unidades disponibles`}
            </li>
            <li><CheckCircle2 size={16} /> Categoría: {data.categoria_nombre}</li>
          </ul>
          <div className="row" style={{ marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn--primary"
              onClick={() => carrito.agregar(data)}
              disabled={data.agotado}
            >
              <ShoppingCart size={16} /> {data.agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
            <Link to="/contacto" className="btn btn--outline">Consultar disponibilidad</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
