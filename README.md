# Hilo y Estilo

Proyecto front-end del equipo (ADSO): tienda/branding **Hilo y Estilo**, con HTML/CSS/JS generado por el equipo.

## Tech stack

- [React 19](https://react.dev) + [Vite](https://vite.dev) (build y dev server con HMR)
- ESLint con los plugins de React

## Cómo montar el proyecto ( nueva máquina)

```bash
git clone https://github.com/EricCGO/Hilo_y_estilo.git
cd Hilo_y_estilo
npm install     # instala node_modules
npm run dev     # abre el servidor de desarrollo (http://localhost:5173)
```

## Scripts disponibles

| Comando          | Qué hace                                        |
|------------------|-------------------------------------------------|
| `npm run dev`    | Servidor de desarrollo con recarga en caliente  |
| `npm run build`  | Genera la versión de producción en `dist/`      |
| `npm run preview`| Sirve el build de producción                                    |
| `npm run lint`   | Revisa el código con ESLint                     |

## Estructura de ramas

- `main` — la rama protegida, solo recibe PRs
- `develop` — rama de integración del equipo
- `feature/<nombre>/<tarea>` — ramas de trabajo de cada quien (se crean desde `develop`)
