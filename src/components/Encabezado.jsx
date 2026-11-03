import MenuUsuario from "./MenuUsuario"

function Encabezado(){
    return(
        <header className="encabezado">
            <div className="encabezado-marca">
                <h1>Mi primer APP con react</h1>
                <nav>
                    <a href="#">Inicio</a>
                    <a href="#">Tecnologias</a>
                    <a href="#">Contactos</a>
                </nav>
            </div>
            <MenuUsuario/>  
        </header>
    )
}

export default Encabezado