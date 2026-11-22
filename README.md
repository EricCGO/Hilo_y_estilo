# Hilo y Estilo

Plataforma web para la distribución y venta de insumos textiles artesanales en Popayán, Cauca.

## Stack

- **Frontend:** React 19 + Vite (`frontend/`)
- **Backend:** Python 3.12 + Django 5.2 + Django REST Framework + MySQL 8 (`backend/`)
- **Autenticación:** JWT en cookies httpOnly (SimpleJWT adaptado)
- **Documentación API:** Swagger en `/api/docs/`

> 📘 **Instalación paso a paso en PCs del SENA:** [`docs/SETUP_SENA.md`](docs/SETUP_SENA.md)
> (MySQL desde cero, semilla, variables de entorno y ejecución).

> ⚠️ Ramas permitidas: `develop` y `feature/Rodrigo/desarrollador4`. **No tocar `main`.**

## Puesta en marcha del backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # ajusta DB_PASSWORD y SECRET_KEY
python manage.py migrate
python manage.py seed_datos          # carga backend/fixtures/catalogo_inicial.json
python manage.py seed_datos --demo   # opcional: cuentas de prueba con SEED_DEMO_PASSWORD
python manage.py runserver 127.0.0.1:8000
```

Endpoints base: `http://127.0.0.1:8000/api/v1/` · Admin Django: `/django-admin/` · Swagger: `/api/docs/`

## Puesta en marcha del frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # http://127.0.0.1:5173 (proxy /api -> Django :8000)
npm run build      # verificación de producción
```

Rutas públicas: `/`, `/catalogo`, `/contacto`, `/login`, `/registro`
Rutas de cliente: `/cuenta`, `/mis-pedidos`, `/envios`
Panel admin: `/admin`, `/admin/productos`, `/admin/categorias`, `/admin/ventas`, `/admin/envios`

### Variables de entorno obligatorias (`backend/.env`)

`SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_TEST_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.
Opcional: `SEED_DEMO_PASSWORD` para `seed_datos --demo`.
El backend falla al arrancar si falta alguna. Genera secretos con
`python3 -c "import secrets; print(secrets.token_urlsafe(48))"`.

Autenticación / cookies JWT (opcional, con valores por defecto):
`JWT_ACCESS_MINUTES`, `JWT_REFRESH_DAYS`, `AUTH_COOKIE_ACCESS_NAME`, `AUTH_COOKIE_REFRESH_NAME`,
`AUTH_COOKIE_REFRESH_PATH`, `AUTH_COOKIE_SAMESITE`, `AUTH_COOKIE_DOMAIN`, `AUTH_COOKIE_SECURE`.

Throttling DRF por IP: `THROTTLE_LOGIN_RATE`, `THROTTLE_REGISTER_RATE`,
`THROTTLE_REFRESH_RATE`, `DRF_NUM_PROXIES` (pon `1` detrás de un proxy inverso).

> En producción con HTTPS configura `AUTH_COOKIE_SECURE=True`. Si el frontend está en
> otro dominio, usa `AUTH_COOKIE_SAMESITE=None` (exige Secure), `CORS_ALLOW_CREDENTIALS=True`
> y `VITE_API_URL` con la URL absoluta de la API.

### Roles

Roles disponibles: `cliente`, `admin_general`, `operador_inventario`, `operador_logistica`, `operador_ventas`.
El panel `/admin` muestra solo los módulos permitidos para cada rol, y la API aplica
los mismos permisos. El administrador general puede gestionar empleados en `/admin/usuarios`.

Para crear usuarios de prueba usa `python manage.py seed_datos --demo` con
`SEED_DEMO_PASSWORD` en `.env` (no hay contraseñas en el repositorio).

## Semilla y documentación

- `backend/fixtures/catalogo_inicial.json` — categorías y productos sin secretos.
- `backend/apps/core/management/commands/seed_datos.py` — carga la semilla y crea cuentas desde `.env`.
- `docs/SETUP_SENA.md` — instalación completa en equipos del SENA.
- `docs/FASE-1-PLAN.md` — ejecución de las fases 1-4.
- `docs/GUIA_DESARROLLO.md` — deuda técnica y prioridades.
- `INFORME_ARQUITECTURA.md` — auditoría inicial.
