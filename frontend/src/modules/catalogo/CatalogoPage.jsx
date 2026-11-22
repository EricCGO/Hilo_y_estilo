import { AlertCircle } from '@/shared/icons';
import EmptyState from '@/shared/components/EmptyState';
import Pagination from '@/shared/components/Pagination';
import Spinner from '@/shared/components/Spinner';
import ProductoCard from './ProductoCard';
import FiltrosCatalogo from './FiltrosCatalogo';
import { useCatalogo } from './useCatalogo';
import './catalogo.css';

export default function CatalogoPage() {
  const {
    data, loading, error, categoria, busqueda, setBusqueda, setCategoria, page, setPage,
  } = useCatalogo();

  return (
    <div className="container section">
      <header className="catalogo-header">
        <span className="eyebrow">Suministros para tu taller</span>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Catálogo de insumos</h2>
      </header>

      <FiltrosCatalogo
        categorias={data?.categorias || []}
        categoria={categoria}
        onCategoria={setCategoria}
        busqueda={busqueda}
        onBusqueda={setBusqueda}
      />

      {loading && <Spinner label="Cargando insumos…" />}

      {error && (
        <div className="error-box">
          <AlertCircle size={16} /> No se pudo cargar el catálogo: {error.message}
        </div>
      )}

      {!loading && !error && (
        data?.productos?.data?.length ? (
          <>
            <div className="catalogo-grid">
              {data.productos.data.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Pagination meta={data.productos.meta} onPage={setPage} />
          </>
        ) : (
          <EmptyState
            title="Sin resultados"
            message="Prueba con otra búsqueda o selecciona una categoría distinta."
          />
        )
      )}
    </div>
  );
}
