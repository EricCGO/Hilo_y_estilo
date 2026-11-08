import { useState } from 'react'
import './App.css'
import Encabezado from './components/Encabezado'
import Sidebar from './components/Sidebar'
import Piepagina from './components/Piepagina'
import { targetas } from './data/targetas.js'
import { operacionesMenu } from './data/menu.js'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')

  return (
    <div className="app-container">
      {/* Encabezado Principal */}
      <Encabezado setSeccionActiva={setSeccionActiva} />

      <div className="main-layout">
        <Sidebar
          seccionActiva={seccionActiva}
          setSeccionActiva={setSeccionActiva}
          operacionesMenu={operacionesMenu}
        />

        <main className="contenido-principal">

          {/* SECCIÓN INICIO / HERO */}
          {seccionActiva === 'inicio' && (
            <>
              {/* Hero Banner */}
              <section className="seccion-hero">
                <div className="hero-grid">
                  <div className="hero-texto">
                    <h2>Cosiendo tu destino</h2>
                    <p>
                      Descubre la elegancia en cada puntada. Creamos piezas únicas que cuentan tu historia y potencian el talento de nuestras manos locales.
                    </p>
                    <button onClick={() => setSeccionActiva('categorias')} className="btn-principal">
                      Ver Catálogo
                    </button>
                  </div>
                  <div className="hero-imagen-card">
                    <div className="card-foto-placeholder">
                      <span>🧵 Percha de Tejidos</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Impulsando el Talento Textil */}
              <section className="seccion-talento">
                <div className="talento-card">
                  <h3>Impulsando el Talento Textil</h3>
                  <p>
                    En <strong>Hilo y Estilo</strong>, nuestra función principal es ser el motor de crecimiento para los pequeños talleres. Nos especializamos en la distribución y venta de productos textiles de alta calidad.
                  </p>
                  <p>
                    Al elegirnos, estás apoyando directamente el sustento de familias artesanas y el desarrollo de la industria local.
                  </p>
                </div>
              </section>

              {/* Nuestros Productos y Colaboradores */}
              <section className="seccion-productos">
                <h3>Nuestros Productos y Colaboradores</h3>
                <div className="grid-productos-colab">
                  <div className="card-colab">
                    <div className="colab-img-bg"></div>
                    <div className="colab-footer">Textiles Artesanales</div>
                  </div>
                  <div className="card-colab">
                    <div className="colab-img-bg"></div>
                    <div className="colab-footer">Hilo Para Costura</div>
                  </div>
                  <div className="card-colab">
                    <div className="colab-img-bg"></div>
                    <div className="colab-footer">Accesorios de Diseño</div>
                  </div>
                </div>
              </section>

              {/* Moda Caucana */}
              <section className="seccion-moda-caucana">
                <div className="moda-header">
                  <h3>Moda Caucana</h3>
                  <p>Apoyamos a la siguiente generación de costureros y diseñadores.</p>
                </div>
                <div className="collage-taller">
                  <div className="polaroid"><span>HILO Y ESTILO</span></div>
                  <div className="polaroid"><span>STUDIO DIARIO</span></div>
                  <div className="polaroid"><span>CREANDO JUNTAS</span></div>
                  <div className="polaroid"><span>PUNTADA A PUNTADA</span></div>
                </div>
              </section>
            </>
          )}

          {/* SECCIÓN CATEGORÍAS */}
          {seccionActiva === 'categorias' && (
            <section className="seccion-categorias">
              <h3>Categoría de Insumos</h3>
              <div className="grid-categorias">
                {targetas.map((item, index) => (
                  <div key={item.id || index} className="card-categoria">
                    <div className="tarjeta-icono">{item.icono}</div>
                    <h4>{item.nombre}</h4>
                    <p>{item.descripcion}</p>
                    <button className="btn-secundario">Ver Insumo</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECCIÓN CONTACTO / HABLEMOS */}
          {seccionActiva === 'contacto' && (
            <section className="seccion-hablemos">
              <div className="hablemos-box">
                <h3>Hablemos</h3>
                <form className="form-hablemos" onSubmit={(e) => { e.preventDefault(); alert('¡Mensaje enviado con éxito!'); }}>
                  <input type="text" placeholder="Tu Nombre" required />
                  <input type="email" placeholder="Correo Electrónico" required />
                  <textarea placeholder="Cuéntanos tu proyecto..." rows="3" required></textarea>
                  <button type="submit" className="btn-enviar">Enviar Mensaje</button>
                </form>
              </div>
            </section>
          )}

        </main>
      </div>

      <Piepagina />
    </div>
  )
}

export default App
