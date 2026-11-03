function Tarjeta({icono, titulo, descripcion, horas, destacada}){
    return(
        <article className={destacada ? "tarjeta tarjeta-destacada" : "destacada"}
        >
            <span className = "tarjeta-icono">{icono}</span>
            <h2>{titulo}</h2>
            <p>{descripcion}</p>
            <p className="tarjeta-horas">{horas}horas</p>
        </article>
    )
}

export default Tarjeta