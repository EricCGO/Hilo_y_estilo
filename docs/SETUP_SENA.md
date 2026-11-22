# Guía de instalación — PCs del SENA

Objetivo: clonar el proyecto, crear la base MySQL desde cero, cargar datos de prueba
y levantar backend + frontend **sin rutas absolutas ni secretos en el repositorio**.

> ⚠️ Regla de ramas: trabajar solo en `develop` y `feature/Rodrigo/desarrollador4`.
> **No hacer checkout, commit, push ni merge en `main`.**

---

## 1. Requisitos

- Python 3.12 (con `venv`)
- Node.js 20+ y npm
- MySQL 8.0 en ejecución
- Git

---

## 2. Clonar y elegir rama

```bash
git clone <URL_DEL_REPOSITORIO> Hilo_y_estilo
cd Hilo_y_estilo
git checkout develop        # o: git checkout feature/Rodrigo/desarrollador4
git pull origin develop     # solo si estás en develop
```

---

## 3. Base de datos MySQL (una sola vez por equipo)

Entra a MySQL con tu usuario root local y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS hilo_y_estilo_api
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS hilo_y_estilo_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hilo_user'@'localhost' IDENTIFIED BY 'TU_CLAVE_LOCAL';
CREATE USER IF NOT EXISTS 'hilo_user'@'127.0.0.1' IDENTIFIED BY 'TU_CLAVE_LOCAL';

GRANT ALL PRIVILEGES ON hilo_y_estilo_api.*  TO 'hilo_user'@'localhost';
GRANT ALL PRIVILEGES ON hilo_y_estilo_api.*  TO 'hilo_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON hilo_y_estilo_test.* TO 'hilo_user'@'localhost';
GRANT ALL PRIVILEGES ON hilo_y_estilo_test.* TO 'hilo_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

`hilo_y_estilo_test` la usa `manage.py test` y se crea/destruye automáticamente.

---

## 4. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edita .env: SECRET_KEY, DB_PASSWORD, SEED_ADMIN_PASSWORD, SEED_DEMO_PASSWORD (opcional)

python manage.py check
python manage.py migrate
python manage.py seed_datos          # categorías + productos + admin
python manage.py seed_datos --demo   # opcional: taller/clientes/operadores de prueba
python manage.py runserver 127.0.0.1:8000
```

### Semilla incluida

- `backend/fixtures/catalogo_inicial.json`: 5 categorías y 3 productos.
  **No contiene usuarios, contraseñas ni rutas absolutas.**
- `python manage.py seed_datos` ejecuta `loaddata catalogo_inicial` y crea el
  usuario administrador usando **solo** variables de entorno:
  - `SEED_ADMIN_EMAIL` (por defecto `admin@hiloystilo.local`)
  - `SEED_ADMIN_PASSWORD` (obligatoria)
  - `SEED_DEMO_PASSWORD` (opcional, para `--demo`)

Para repetir la carga desde cero:

```bash
python manage.py flush --noinput   # ⚠️ borra todos los datos de hilo_y_estilo_api
python manage.py migrate
python manage.py seed_datos --demo
```

### Pruebas automatizadas (MySQL real)

```bash
python manage.py test
```

Si da error `1045 Access denied`, revisa `DB_USER`/`DB_PASSWORD` en `.env`.
Si da `1049 Unknown database`, crea `hilo_y_estilo_test` y sus permisos (paso 3).

---

## 5. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=/api/v1 (usa el proxy de Vite)
npm run dev                # http://127.0.0.1:5173
npm run build              # verificación de producción
```

El proxy de `vite.config.js` redirige `/api` a `http://127.0.0.1:8000`.

---

## 6. Cuentas y roles

| Rol | Uso |
|---|---|
| `admin_general` | Panel `/admin` completo, incluido `/admin/usuarios` |
| `operador_inventario` | Productos, categorías e inventario |
| `operador_logistica` | Envíos y guías |
| `operador_ventas` | Pedidos y estados |
| `cliente` | Tienda, carrito, pedidos y envíos propios |

Con `--demo` se crean: `cliente.demo@`, `inventario.demo@`, `logistica.demo@`,
`ventas.demo@` (todos usan `SEED_DEMO_PASSWORD`).

---

## 7. Secretos y `.env`

- `backend/.env` y `frontend/.env` **están ignorados** por Git.
- En el repo solo se versionan `backend/.env.example` y `frontend/.env.example`.
- Nunca subas `.env`, claves MySQL, `SECRET_KEY` ni contraseñas de prueba reales.
- `venv/`, `node_modules/`, `dist/` y `__pycache__/` también están ignorados.

---

## 8. Solución rápida de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Access denied for user 'hilo_user'` | Clave distinta a `.env` | Actualizar `DB_PASSWORD` |
| `Unknown database 'hilo_y_estilo_test'` | Falta BD de pruebas | Crearla y dar permisos (paso 3) |
| Frontend muestra error de red | Django apagado o proxy | Levantar backend en `:8000` |
| Login no guarda sesión | `AUTH_COOKIE_SECURE=True` sin HTTPS | Usar `False` en desarrollo local |
| CORS en otro dominio | Frontend y API en dominios distintos | `AUTH_COOKIE_SAMESITE=None` + `Secure` + CORS con credenciales |
