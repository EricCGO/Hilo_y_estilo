import { Link } from 'react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import './home.css';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <span className="hero-badge">SUMINISTROS & INSUMOS TEXTILES</span>
        <h1 className="hero-title">Cosiendo tu destino</h1>
        <p className="hero-description">
          Descubre la elegancia en cada puntada. Suministramos hilos de alta resistencia,
          telas artesanales y herramientas de precisión que potencian el talento de nuestras
          manos locales.
        </p>
        <div className="hero-buttons">
          <Link to="/catalogo" className="btn btn--primary">
            Ver catálogo <ArrowRight size={16} />
          </Link>
          <Link to="/contacto" className="btn btn--outline">
            <Sparkles size={16} /> Comienza tu proyecto
          </Link>
        </div>
      </div>
      <div className="hero-image-wrapper">
        <div className="hero-card-bg">
          <img
            src="/images/hero-cosiendo-tu-destino.jpg"
            alt="Editorial de moda contemporáneo: abrigo azul en escenario urbano"
            className="hero-image"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
