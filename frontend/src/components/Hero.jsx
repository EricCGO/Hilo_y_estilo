import React from 'react';
import './Hero.css'; // Asegúrate de importar el CSS correspondiente

export const Hero = () => {
  return (
    <section className="hero-section">
      {/* Bloque de texto a la izquierda */}
      <div className="hero-content">
        <h1 className="hero-title">Cosiendo tu destino</h1>
        <p className="hero-description">
          Descubre la elegancia en cada puntada. Creamos piezas únicas que cuentan tu historia
          y potencian el talento de nuestras manos locales.
        </p>
        <button className="hero-btn">Ver Catálogo</button>
      </div>

      {/* Bloque de imagen con marco/tarjeta a la derecha */}
      <div className="hero-image-wrapper">
        <div className="hero-card-bg">
          <img
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000"
            alt="Muestra de ropa en perchero"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};
