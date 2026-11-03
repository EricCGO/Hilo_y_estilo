function PiePagina() {
    const anio = new Date().getFullYear()
    return (
        <footer className="pie-pagina">
            <p>© {anio} Hilo Y Estilo. Todos los derechos reservados.</p>
        </footer>
    )
}

export default PiePagina