import React from 'react';
import '../Encabezado.css';
import logo from '../imagenes/logo.png';

function Encabezado() {
  return (
    <header className="encabezado-principal">
      <div className="encabezado-logo-container">
        <img src={logo} alt="Hilo & Estilo Logo" className="logo-imagen" />
      </div>
      <div className="encabezado-textos">
        <h1>HILO & ESTILO</h1>
        <p>COSIENDO TU DESTINO</p>
      </div>
    </header>
  );
}

export default Encabezado;