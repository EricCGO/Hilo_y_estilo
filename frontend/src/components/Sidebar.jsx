import React from 'react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🧵</span>
            <h3>HILO & ESTILO</h3>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="sidebar-content">
          <p className="sidebar-tagline">Categorías de Insumos Textiles</p>
          <ul className="sidebar-nav">
            <li><a href="#hilos" onClick={onClose}>🧵 Hilos & Hilazas de Alta Resistencia</a></li>
            <li><a href="#telas" onClick={onClose}>✂️ Telas Específicas & Tejidos Caucanos</a></li>
            <li><a href="#herramientas" onClick={onClose}>🔨 Herramientas & Kits de Diseño</a></li>
            <li><a href="#maquinaria" onClick={onClose}>⚙️ Repuestos & Maquinaria Textil</a></li>
            <li><a href="#tintes" onClick={onClose}>🎨 Tintes & Colorantes Artesanales</a></li>
          </ul>

          <div className="sidebar-footer">
            <p className="footer-title">Popayán, Cauca</p>
            <p className="footer-sub">Impulsando el sector textil local</p>
          </div>
        </div>
      </aside>
    </>
  );
}
