import { Link } from 'react-router';
import { X, MapPin, Scissors } from '@/shared/icons';

export const CATEGORIAS = [
  { slug: 'hilos-e-hilazas', label: '🧵 Hilos e hilazas de alta resistencia' },
  { slug: 'telas-y-tejidos', label: '✂️ Telas y tejidos caucanos' },
  { slug: 'herramientas-y-kits', label: '🔨 Herramientas y kits de diseño' },
  { slug: 'repuestos-y-maquinaria', label: '⚙️ Repuestos y maquinaria textil' },
  { slug: 'tintes-y-colorantes', label: '🎨 Tintes y colorantes artesanales' },
];

/** Contrato real: isOpen / onClose. */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar-drawer ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
        aria-label="Categorías de insumos"
      >
        <div className="sidebar-drawer__header">
          <div className="row">
            <Scissors size={18} className="text-gold" aria-hidden="true" />
            <h3>HILO & ESTILO</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-drawer__content">
          <p className="sidebar-drawer__tagline">Categorías de insumos textiles</p>
          <nav aria-label="Categorías">
            <ul className="sidebar-nav">
              {CATEGORIAS.map(({ slug, label }) => (
                <li key={slug}>
                  <Link to={`/catalogo?categoria=${slug}`} onClick={onClose}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="sidebar-drawer__footer">
          <p className="row"><MapPin size={14} className="text-gold" /> <strong>Popayán, Cauca</strong></p>
          <span>Impulsando el sector textil local</span>
        </div>
      </aside>
    </>
  );
}
