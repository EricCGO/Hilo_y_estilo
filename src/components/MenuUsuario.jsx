import fotoPerfil from '../images/rlcs logo.png'

function MenuUsuario(){
    const nombre = 'Eric Gomez'
    const rol = 'Aprendiz SENA'
    return(
        <div className="MenuUsuario">
            <button type="button" className="menu_usuario-boton">
                <img src={fotoPerfil} alt={`Foto de ${nombre}`} className="avatar" />
                <span className='menu-usuarios-datos'>
                    <span className='menu-usuario-nombre'>{nombre}</span>
                    <span className='menu-usuario-rol'>{rol}</span>
                </span>
                <span className='flecha'>▼</span>
            </button>

            <ul className='menu-desplegable'>
                <li><a href="#">👤 Mi Perfil</a></li>
                <li><a href="#">⚙️ Configuración</a></li>
                <li className='Separador'></li>
                <li><a href="#" className='cerrar-sesion'>Cerrar sesión</a></li>
            </ul>
        </div>
    )
}

export default MenuUsuario