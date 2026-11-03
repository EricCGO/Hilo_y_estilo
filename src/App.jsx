import './App.css'
import Encabezado from './components/Encabezado'
import Tarjeta from './components/Tarjeta'
import PiePagina from './components/PiePagina'
import './components/Presentacion'
import Presentacion from './components/Presentacion'
import Sidebar from './components/Sidebar'
import {tarjetas} from './data/tarjetas'

function App(){

  const programa = 'Analisis y Desarrollo de Software'
  return(
    <div className="layout">
  <Encabezado/>
  <Sidebar/>

  <main className="contenido">
    <h2>Bienvenidos al programa {programa}</h2>
      <section className='tarjetas'>
        {tarjetas.map((tarjeta) => (
          <Tarjeta 
            key={tarjeta.id}
            icono={tarjeta.icono}
            titulo={tarjeta.titulo}
            descripcion={tarjeta.descripcion}
            horas={tarjeta.horas}
            destacada={tarjeta.destacada}
          />
        ))}
      </section>
  </main>
  <Presentacion
  Titulo1="Presentación"
  descripcion="Soy estudiante de Analisis y Desarrollo de Software, me gusta aprender nuevas tecnologias y mejorar mis habilidades en el desarrollo de software."
  Nombre="Eric Camilo Gomez Galviz"
  Correo="gomezgalvizericcamilo@gmail.com"
  Telefono="3137464664"
  Ciudad="Popayán"
  Pais="Colombia"
  />

  <PiePagina />
    </div>
  )
}

export default App