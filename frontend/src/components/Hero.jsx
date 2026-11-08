import React from 'react';
import './Hero.css';

export const Hero = () => {
  return (
    <section className="hero-section">
      {/* Bloque de texto a la izquierda */}
      <div className="hero-content">
        <span className="hero-badge">SUMINISTROS & INSUMOS TEXTILES</span>
        <h1 className="hero-title">Cosiendo tu destino</h1>
        <p className="hero-description">
          Descubre la elegancia en cada puntada. Suministramos hilos de alta resistencia,
          telas artesanales y herramientas de precisión que potencian el talento de nuestras manos locales.
        </p>
        <div className="hero-buttons">
          <a href="#destacados" className="hero-btn primary">Ver Catálogo</a>
          <a href="#contacto" className="hero-btn secondary">Comienza tu Proyecto</a>
        </div>
      </div>

      {/* Bloque de imagen con marco/tarjeta a la derecha */}
      <div className="hero-image-wrapper">
        <div className="hero-card-bg">
          <img
            src="https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1000"
            alt="Hilos y carreteles de costura artesanal"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
