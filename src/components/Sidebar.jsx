import {opcionesMenu } from "../data/menu.js"



function Sidebar(){
    return(
        <aside className="sidebar">
            <h3 className="Sidebar-titulo">Menú</h3>
            <nav>
                <ul className="sidebar-menu">
                    {opcionesMenu.map((opcion) => 
                    <li key={opcion.id}>
                        <a href={opcion.url}>
                            {opcion.icono} {opcion.texto}
                        </a>
                    </li>
                    )}
                </ul>
            </nav>
            <p className="sidebar-pie"> {opcionesMenu.length} 3229450 ADSO</p>
        </aside>
    )
}

export default Sidebar  

