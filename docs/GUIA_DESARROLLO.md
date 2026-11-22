# Guía de desarrollo — Hilo y Estilo

Basada en el estado real del repositorio al 22/11/2026, después de las cuatro fases ejecutadas. Sin idealización: esto es lo que hay, lo que falta y qué hacer primero.

> Para instalar el proyecto desde cero en un PC del SENA, empieza por [`SETUP_SENA.md`](SETUP_SENA.md).

## 1. Estado real del software hoy

**Ya funciona de extremo a extremo (verificado en navegador y con pruebas):**

- **Backend:** Django 5.2 + DRF + MySQL 8. Arranca con `venv/bin/python manage.py runserver 127.0.0.1:8000`. `manage.py check` limpio, `makemigrations --check` sin cambios pendientes, **15 pruebas en verde**.
- **Base de datos:** la API usa **`hilo_y_estilo_api`** (creada por nosotros). Tiene las migraciones aplicadas y datos semilla: 5 categorías, 3 productos, usuario admin y datos de prueba de un pedido. La BD antigua **`hilo_y_estilo`** (otro esquema, con ventas/empleados/usuarios propios) **está intacta y sin tocar**.
- **API versionada** bajo `/api/v1/`: `health`, `categorias`, `productos`, `productos/{slug}`, `auth/{register,login,refresh,logout,me}`, `contacto`, `pedidos` (crear/listar/detalle/cancelar), `envios`, y el bloque `/admin/` (dashboard, productos CRUD + stock, categorías CRUD, pedidos + cambio de estado, envíos crear/editar). Swagger en `/api/docs/`, admin nativo en `/django-admin/`.
- **Autenticación:** JWT en **cookies httpOnly** con refresh rotativo; ni un token en `localStorage`. `requireAuth`/`requireRole` equivalentes en DRF (`IsAdminUserRole`, `IsOwnerOrAdmin`). Throttling DRF por IP en login/registro/refresh (tasas configurables por entorno).
- **Transacciones reales:** crear pedido bloquea stock con `select_for_update`, descuenta y registra `MovimientoInventario`; cancelar reintegra stock; ajustar stock es transaccional; pasar pedido a `enviado` crea el envío; entregar envío marca el pedido como entregado.
- **Frontend:** React 19 + Vite 8, **refactorizado por completo**. Router real (`createBrowserRouter`), `AuthContext`, guards, `PublicLayout`/`AdminLayout`, módulos por dominio (`home`, `catalogo`, `cuenta`, `contacto`, `pedidos`, `envios`, `admin`), `apiClient.js` con `credentials: 'include'` y refresco automático en 401, `tokens.css` como sistema de diseño único, iconos SVG. `npm run build` pasa (**384.60 kB JS / 21.87 kB CSS**).
- **Flujo comprobado:** registro → catálogo → carrito → pedido → confirmación/admin → guía de envío → seguimiento del cliente.
- **Código muerto eliminado:** Express completo, `Hero.css` raíz (PostScript), componentes y datos antiguos del frontend.

**Sigue siendo prototipo o parcial:**

- **Solo existen dos roles:** `cliente` y `admin`. No hay empleados de inventario, logística ni ventas, ni permisos granulares.
- El carrito vive en **`localStorage`**: no se comparte entre dispositivos ni sobrevive a otro navegador. No hay carrito persistente en servidor.
- El formulario de contacto **guarda el mensaje en BD pero no envía correo ni notifica** al admin.
- **No hay pagos**, ni modelo `Pago`, ni cálculo de costo de envío por ciudad/peso (siempre `costo_envio=0`).
- **No hay subida de imágenes desde la UI** (el modelo `Producto` tiene `ImageField`, pero el formulario admin solo texto).
- La dirección de entrega es un **string snapshot** dentro del pedido; no hay modelo `Direccion` por usuario.
- `MovimientoInventario` **no registra qué usuario hizo el movimiento** (no tiene `usuario`), así que la auditoría es incompleta.
- **No hay tests de frontend**, ni CI, ni linter, ni type checking. Lo único que hay son 15 tests de Django.
- El rate limit usa **LocMemCache**: se reinicia con el proceso y no es compartido entre workers.
- **No hay `backend/server.js` con cierre elegante** (SIGTERM): se arranca con `runserver`/WSGI y el despliegue queda sin definir.
- Los settings `prod.py` existen pero **nunca se han probado**; no hay HTTPS, Gunicorn, nginx ni serving de estáticos/media definido.
- **Bug real de UI:** en `layouts.css:266` el `.admin-sidebar` se oculta con `display: none` en pantallas ≤860 px y no hay menú alternativo → el panel admin es **inusable en móvil/tablet**.
- Las respuestas de API **ya están unificadas** bajo `{ data: … }` (o `{ data, meta }` en listados paginados) y los errores bajo `{ error: { code, message, details } }`.
- **Todo el trabajo de las fases 2-4 está sin commitear** (36 entradas en `git status`), sobre la rama `feature/Rodrigo/desarrollador4`.

## 2. Lo que falta por construir

**Roles y personas (lo más importante que falta):**

- ~~Ampliar `Usuario.Rol` con roles operativos~~ **Hecho:** `admin_general`, `operador_inventario`, `operador_logistica`, `operador_ventas` y `cliente`, con CRUD en `/admin/usuarios`. Todavía se puede evolucionar a un modelo `Empleado` con `cargo`/`taller_asignado`.
- Permisos por dominio: quién puede ver costos, ajustar stock, cambiar estados o crear guías (hoy `admin` lo puede todo y `cliente` casi nada).
- CRUD de usuarios/empleados en el panel React (hoy solo se puede desde `/django-admin/`).
- Asignación de pedidos a empleados (picking → preparación → despacho) y bitácora de who-did-what.

**Módulos de negocio pendientes:**

- **Pagos**: modelo `Pago`, estados, pasarela (Stripe/PayPal/transferencia local), webhooks y comprobantes.
- **Envíos avanzados**: tarifas por ciudad/peso, múltiples guías por pedido, devoluciones y reenvíos.
- **Direcciones**: modelo `Direccion` por usuario y selección en checkout.
- **Notificaciones**: correo/SMS/WhatsApp al cambiar estado de pedido o envío; bandeja de mensajes de contacto con respuesta.
- **Reportes**: ventas por periodo, productos más vendidos, valoración de inventario, alertas de stock bajo con destinatario.
- **Imágenes**: endpoint de upload, galería por producto, compresión y CDN.
- **Cupones / descuentos / devoluciones** (la BD legacy ya tenía tablas de campañas; hay que rediseñarlas, no copiarlas).

**Integraciones y calidad:**

- Tests de frontend (Vitest + Testing Library) y E2E (Playwright) del flujo completo.
- CI con GitHub Actions: `check` + `test` + `build` en cada PR; ESLint/Prettier; pre-commit.
- Docker + Gunicorn + nginx, settings de producción probados, backups programados de MySQL.
- Redis para rate limit y caché; migración de los datos de la BD legacy `hilo_y_estilo` si se van a reutilizar.
- Normalizar el envelope de respuestas de la API y regenerar documentación OpenAPI.

## 3. Qué debo mejorar ahora (prioridades)

**P0 — antes de seguir escribiendo código:**

1. **Seguridad de credenciales.** Ya se rotaron `hilo_user`, `SECRET_KEY` y la clave del admin seed; están solo en `backend/.env` (ignorado por Git). Falta rotar la clave **root** de MySQL, que nunca estuvo en el repo pero sí se usó en comandos de mantenimiento: cambiarla con `ALTER USER 'root'@'localhost' IDENTIFIED BY '...'`. Además, conviene reducir los privilegios de `hilo_user` a lo estrictamente necesario sobre `hilo_y_estilo_api`. Nunca uses root desde la aplicación.
2. **Commitea el trabajo existente.** 36 archivos modificados sin commit es el mayor riesgo de perder el avance. Haz commits por dominio (backend core, backend módulos, frontend router/layouts, frontend módulos, docs) y luego mergea a `develop`.
3. **Corrige el menú admin en móvil.** En `frontend/src/layouts/layouts.css:266`, sustituye `display: none` por un drawer/hamburger como el del layout público. Es una funcionalidad rota, no un detalle estético.

**P1 — esta semana:**

4. ~~Unifica el contrato de respuestas.~~ **Hecho:** todas las vistas devuelven `{ data }` / `{ data, meta }` y los errores pasan por `apps/core/exceptions.py`. El frontend ya consume ese envelope.
5. ~~Ejecuta los tests contra MySQL, no contra SQLite.~~ **Hecho:** `manage.py test` usa `hilo_y_estilo_test` (MySQL/InnoDB) con `DB_USER`/`DB_PASSWORD` de `.env`. Para un diagnóstico aislado en SQLite: `DJANGO_SETTINGS_MODULE=config.settings.sqlite venv/bin/python manage.py test`.
6. **Añade `usuario` a `MovimientoInventario`** (FK a `Usuario`, `SET_NULL`) y muéstralo en el admin. Sin esto no hay auditoría real de inventario.
7. **API robustez:** timeouts y abort en `apiClient`, `errorElement` por ruta en el router (el error de React mostró un stack trace en pantalla durante la auditoría), y estados de carga/error consistentes.

**P2 — siguiente iteración:**

8. Roles operativos y permisos granulares; CRUD de empleados en React.
9. Pagos, notificaciones y tarifas de envío.
10. Producción: `prod.py` probado, Gunicorn, HTTPS, Redis, backups, CI y tests E2E.

**Sobre estilos y BD:** los tokens ya están unificados, pero quedan estilos inline y valores mágicos; conviene migrar a CSS Modules antes de crecer. En MySQL, las tablas ya tienen índices y `utf8mb4`; lo urgente no es el esquema, sino **credenciales, backups y probar las transacciones en el motor real**.

## 4. Siguiente paso inmediato

Ejecuta esto **ahora**, en este orden, y no avances hasta que todo salga verde:

```bash
cd /home/pc/Documentos/Hilo_y_estilo

# 1) Verifica estado y security antes de tocar nada
git status --short
git branch --show-current

# 2) Backend: errores, migraciones y pruebas
cd backend
venv/bin/python manage.py check
venv/bin/python manage.py makemigrations --check --dry-run
venv/bin/python manage.py test

# 3) Frontend: compilación
cd ../frontend
npm run build

# 4) Arranque real y smoke test
cd ../backend && venv/bin/python manage.py runserver 127.0.0.1:8000 --noreload &
cd ../frontend && npm run dev -- --host 127.0.0.1 &
curl -s http://127.0.0.1:8000/api/v1/health/
curl -s http://127.0.0.1:8000/api/v1/productos/ | head -c 200
```

**Resultado esperado:** `check` sin issues, `No changes detected`, `Creating test database for alias 'default'...` / `Ran 27 tests ... OK` / `Destroying test database...` (MySQL real), build correcto, `{"data":{"status":"ok","db":"ok"}}` y el listado de productos con `data`/`meta`.

> La suite corre sobre **MySQL real**: el runner crea y destruye `DB_TEST_NAME` (`hilo_y_estilo_test`) con el usuario de `.env`. Ese usuario necesita `ALL PRIVILEGES` sobre esa BD. Para diagnósticos rápidos en SQLite: `DJANGO_SETTINGS_MODULE=config.settings.sqlite venv/bin/python manage.py test` (no es la configuración oficial).

**Tarea concreta justo después:** haz el primer commit del trabajo acumulado (backend y frontend por separado) y cambia las credenciales de MySQL y el `SECRET_KEY`. Con eso el proyecto queda congelado, seguro y listo para atacar el P1 sin miedo a perder el rumbo.
