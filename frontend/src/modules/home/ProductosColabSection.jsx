const TARJETAS = [
  {
    label: 'Textiles artesanales',
    imagen: '/images/textiles-artesanales.jpg',
    alt: 'Rollos de telas coloridas en un taller textil',
  },
  {
    label: 'Hilo para costura',
    imagen: '/images/hilo-para-costura.jpg',
    alt: 'Conos de hilo de colores para costura',
  },
  {
    label: 'Accesorios de diseño',
    imagen: '/images/accesorios-de-diseno.jpg',
    alt: 'Tijeras, hilos y herramientas de costura en una caja',
  },
];

export default function ProductosColabSection() {
  return (
    <section className="section container">
      <span className="eyebrow">Alianzas que suman</span>
      <h3 className="section-title">Nuestros productos y colaboradores</h3>
      <div className="productos-colab">
        {TARJETAS.map(({ label, imagen, alt }) => (
          <article className="card-colab" key={label}>
            <img className="colab-img" src={imagen} alt={alt} loading="lazy" />
            <div className="colab-footer">{label}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
