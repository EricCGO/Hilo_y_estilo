import { Search } from '@/shared/icons';

export default function FiltrosCatalogo({
  categorias, categoria, onCategoria, busqueda, onBusqueda,
}) {
  return (
    <div className="filtros-catalogo">
      <div className="field filtros-catalogo__buscar">
        <label htmlFor="buscar-producto">Buscar insumo</label>
        <div className="row" style={{ position: 'relative' }}>
          <Search size={16} className="text-gold" aria-hidden="true" />
          <input
            id="buscar-producto"
            type="search"
            placeholder="Hilos, telas, tijeras…"
            value={busqueda}
            onChange={(event) => onBusqueda(event.target.value)}
          />
        </div>
      </div>
      <div className="filtros-catalogo__chips" role="group" aria-label="Filtrar por categoría">
        <button
          className={`chip ${!categoria ? 'active' : ''}`}
          onClick={() => onCategoria('')}
          type="button"
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`chip ${categoria === cat.slug ? 'active' : ''}`}
            onClick={() => onCategoria(cat.slug)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
