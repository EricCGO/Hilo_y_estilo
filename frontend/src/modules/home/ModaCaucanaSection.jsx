const TARJETAS = [
  {
    titulo: 'HILO Y ESTILO',
    imagen: '/images/moda-hilo-y-estilo.jpg',
    alt: 'Perchero editorial de prendas neutras bien confeccionadas',
  },
  {
    titulo: 'STUDIO DIARIO',
    imagen: '/images/moda-studio-diario.jpg',
    alt: 'Editorial de moda contemporáneo en estudio',
  },
  {
    titulo: 'CREANDO JUNTOS',
    imagen: '/images/moda-creando-juntos.jpg',
    alt: 'Costurera trabajando una tela con patrón en el taller',
  },
  {
    titulo: 'PUNTADA A PUNTADA',
    imagen: '/images/moda-puntada-a-puntada.jpg',
    alt: 'Flat lay de prendas y accesorios de diseño',
  },
];

export default function ModaCaucanaSection() {
  return (
    <section className="section container">
      <div className="moda-header">
        <div>
          <span className="eyebrow">Raíces y futuro</span>
          <h3>Moda Caucana</h3>
        </div>
        <p>Apoyamos a la siguiente generación de costureros y diseñadores.</p>
      </div>
      <div className="collage-taller">
        {TARJETAS.map(({ titulo, imagen, alt }) => (
          <figure className="polaroid" key={titulo}>
            <img src={imagen} alt={alt} loading="lazy" />
            <figcaption><span>{titulo}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
