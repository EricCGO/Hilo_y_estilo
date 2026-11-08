import React from 'react';
import './Navbar.css';

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="navbar-container">
      <div className="navbar-top">
        <button className="sidebar-trigger" onClick={onOpenSidebar}>
          <span></span><span></span><span></span>
        </button>

        <div className="title-centered">
          <h1 className="brand-title">HILO & ESTILO</h1>
          <p className="brand-subtitle">— ARTESANÍA Y DISEÑO LOCAL —</p>
        </div>

        <div className="header-actions">
          <button className="icon-btn">🔍</button>
          <button className="icon-btn">👤</button>
        </div>
      </div>

      <nav className="navbar-menu">
        <a href="#inicio" className="nav-link active">Inicio</a>
        <a href="#categorias" className="nav-link">Catálogo de Insumos</a>
        <a href="#destacados" className="nav-link">Productos Destacados</a>
        <a href="#nosotros" className="nav-link">Quiénes Somos</a>
        <a href="#artesanos" className="nav-link">Talleres Locales</a>
        <a href="#contacto" className="nav-link">Contacto</a>
      </nav>
    </header>
  );
}
