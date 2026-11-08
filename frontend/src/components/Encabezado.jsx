import React from 'react';

function Encabezado({ setSeccionActiva }) {
  return (
    <header className="header-principal">
      <div className="header-contenido">

        {/* Logo Circular HE */}
        <div className="logo-area">
          <div className="logo-circulo">
            <span className="logo-texto">HE</span>
          </div>
          <span className="logo-titulo-completo hidden sm:inline">HILO &amp; ESTILO</span>
        </div>

        {/* Título Central */}
        <div className="header-centro">
          <h1>HILO <span>&</span> ESTILO</h1>
          <div className="subtitulo-decorado">
            <span className="linea-deco"></span>
            <span className="subtitulo-header">COSIENDO TU DESTINO</span>
            <span className="linea-deco"></span>
          </div>
        </div>

        {/* Acciones derecha */}
        <div className="header-acciones">
          <button className="btn-icono" title="Carrito">
            <i className="fa-solid fa-bag-shopping"></i>
          </button>
        </div>
      </div>

      {/* Menú de Navegación Completo según tu diseño */}
      <nav className="nav-pildoras">
        <div className="pildoras-container">
          <button onClick={() => setSeccionActiva('inicio')} className="pildora">Inicio</button>
          <button onClick={() => setSeccionActiva('sesion')} className="pildora">Inicio de sesion</button>
          <button onClick={() => setSeccionActiva('añadir')} className="pildora">Añadir producto</button>
          <button onClick={() => setSeccionActiva('ventas')} className="pildora">Ventas</button>
          <button onClick={() => setSeccionActiva('categorias')} className="pildora">Categoria de insumos</button>
          <button onClick={() => setSeccionActiva('envios')} className="pildora">Envíos</button>
          <button onClick={() => setSeccionActiva('contacto')} className="pildora">Contacto</button>
          <button onClick={() => setSeccionActiva('cuenta')} className="pildora">Cuenta</button>
        </div>
      </nav>
    </header>
  );
}

export default Encabezado;
