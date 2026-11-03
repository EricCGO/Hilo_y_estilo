function Presentacion({Titulo1, descripcion,Nombre, Correo, Telefono, Ciudad, Pais}){
    return(
        <article className="Tarjeta_presentacion">
                <h2>{Titulo1}</h2>
                <h3>Hola soy {Nombre}</h3>
                    <p>{descripcion}</p>
                    <h2>Mis datos son:</h2>
                    <ul>
                        <li>Correo: {Correo}</li>
                        <li>Teléfono: {Telefono}</li>
                        <li>Ciudad: {Ciudad}</li>
                        <li>País: {Pais}</li>
                    </ul>
        </article>
    )
}

export default Presentacion