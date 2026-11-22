import json

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Usuario

# Credencial exclusiva de pruebas (nunca se usa en datos reales).
CLAVE_TEST = "claveDePruebaUnica123"


class AutenticacionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registro_crea_cliente_y_cookies(self):
        respuesta = self.client.post(
            "/api/v1/auth/register/",
            {
                "nombre": "Taller Prueba",
                "email": "taller@ejemplo.com",
                "password": "claveSegura123",
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, 201)
        self.assertEqual(respuesta.data["data"]["rol"], "cliente")
        self.assertIn("access_token", respuesta.cookies)
        self.assertIn("refresh_token", respuesta.cookies)
        self.assertTrue(Usuario.objects.filter(email="taller@ejemplo.com").exists())
        access = respuesta.cookies["access_token"]
        refresh = respuesta.cookies["refresh_token"]
        self.assertTrue(access["httponly"])
        self.assertEqual(access["samesite"], "Lax")
        self.assertEqual(refresh["path"], "/api/v1/auth/")
        self.assertNotIn("access", respuesta.data)

    def test_login_y_me_devuelven_el_usuario(self):
        Usuario.objects.create_user(
            username="admin@hiloystilo.local",
            email="admin@hiloystilo.local",
            password=CLAVE_TEST,
            rol=Usuario.Rol.ADMIN,
        )
        respuesta = self.client.post(
            "/api/v1/auth/login/",
            {"email": "admin@hiloystilo.local", "password": CLAVE_TEST},
            format="json",
        )
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data["data"]["rol"], "admin_general")
        me = self.client.get("/api/v1/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["data"]["email"], "admin@hiloystilo.local")

    def test_registro_rechaza_roles_privilegiados(self):
        respuesta = self.client.post(
            "/api/v1/auth/register/",
            {
                "nombre": "Infiltrado", "email": "infiltrado@ejemplo.com",
                "password": CLAVE_TEST, "rol": "admin_general", "is_staff": True,
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, 400)
        self.assertIn("rol", respuesta.data["error"]["details"])
        self.assertFalse(Usuario.objects.filter(email="infiltrado@ejemplo.com").exists())

    def test_registro_rechaza_correo_duplicado_y_password_debil(self):
        base = {"nombre": "Taller", "email": "dup@ejemplo.com", "password": CLAVE_TEST}
        self.assertEqual(self.client.post("/api/v1/auth/register/", base, format="json").status_code, 201)
        duplicado = self.client.post("/api/v1/auth/register/", base, format="json")
        self.assertEqual(duplicado.status_code, 400)
        self.assertIn("email", duplicado.data["error"]["details"])

        debil = self.client.post(
            "/api/v1/auth/register/",
            {**base, "email": "debil@ejemplo.com", "password": "12345678"},
            format="json",
        )
        self.assertEqual(debil.status_code, 400)
        self.assertIn("password", debil.data["error"]["details"])

    def test_refresh_rota_y_el_anterior_queda_invalido(self):
        Usuario.objects.create_user(
            username="rot@ejemplo.com", email="rot@ejemplo.com", password=CLAVE_TEST
        )
        login = self.client.post(
            "/api/v1/auth/login/",
            {"email": "rot@ejemplo.com", "password": CLAVE_TEST},
            format="json",
        )
        viejo = login.cookies["refresh_token"].value
        self.client.cookies["refresh_token"] = viejo
        rotado = self.client.post("/api/v1/auth/refresh/")
        self.assertEqual(rotado.status_code, 200)
        nuevo = rotado.cookies["refresh_token"].value
        self.assertNotEqual(nuevo, viejo)

        self.client.cookies["refresh_token"] = viejo
        rechazado = self.client.post("/api/v1/auth/refresh/")
        self.assertEqual(rechazado.status_code, 401)

    def test_login_no_revela_si_el_correo_existe(self):
        Usuario.objects.create_user(
            username="real@ejemplo.com", email="real@ejemplo.com",
            password=CLAVE_TEST,
        )
        inexistente = self.client.post(
            "/api/v1/auth/login/",
            {"email": "nadie@ejemplo.com", "password": CLAVE_TEST},
            format="json",
        )
        erronea = self.client.post(
            "/api/v1/auth/login/",
            {"email": "real@ejemplo.com", "password": "otraClave123"},
            format="json",
        )
        self.assertEqual(inexistente.status_code, erronea.status_code)
        self.assertEqual(inexistente.data["error"]["details"], erronea.data["error"]["details"])


class RateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        Usuario.objects.create_user(
            username="admin@test.com", email="admin@test.com",
            password="claveSegura123", rol=Usuario.Rol.ADMIN,
        )

    def test_login_bloquea_tras_demasiados_intentos(self):
        payload = {"email": "admin@test.com", "password": "claveSegura123"}
        for _ in range(10):
            respuesta = self.client.post("/api/v1/auth/login/", payload, format="json")
            self.assertEqual(respuesta.status_code, 200)
        bloqueada = self.client.post("/api/v1/auth/login/", payload, format="json")
        self.assertEqual(bloqueada.status_code, 429)
        self.assertEqual(
            json.loads(bloqueada.content)["error"]["code"], "DEMASIADAS_SOLICITUDES"
        )
        cache.clear()

    def test_registro_tiene_limite_prop(self):
        for indice in range(5):
            respuesta = self.client.post(
                "/api/v1/auth/register/",
                {
                    "nombre": f"Taller {indice}",
                    "email": f"taller{indice}@ejemplo.com",
                    "password": CLAVE_TEST,
                },
                format="json",
            )
            self.assertEqual(respuesta.status_code, 201)
        bloqueada = self.client.post(
            "/api/v1/auth/register/",
            {"nombre": "Extra", "email": "extra@ejemplo.com", "password": CLAVE_TEST},
            format="json",
        )
        self.assertEqual(bloqueada.status_code, 429)
        cache.clear()


class AdminUsuariosTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_user(
            username="jefe@test.com", email="jefe@test.com",
            password=CLAVE_TEST, rol=Usuario.Rol.ADMIN,
        )
        self.operador = Usuario.objects.create_user(
            username="oper@test.com", email="oper@test.com",
            password=CLAVE_TEST, rol=Usuario.Rol.INVENTARIO,
        )

    def test_admin_general_gestiona_empleados_con_envelope(self):
        self.client.force_authenticate(self.admin)
        listado = self.client.get("/api/v1/admin/usuarios/")
        self.assertEqual(listado.status_code, 200)
        self.assertIn("data", listado.data)

        creado = self.client.post(
            "/api/v1/admin/usuarios/",
            {
                "nombre": "Nuevo Operador", "email": "nuevo@test.com",
                "password": CLAVE_TEST, "rol": Usuario.Rol.LOGISTICA,
            },
            format="json",
        )
        self.assertEqual(creado.status_code, 201)
        self.assertEqual(creado.data["data"]["rol"], Usuario.Rol.LOGISTICA)
        usuario = Usuario.objects.get(email="nuevo@test.com")
        self.assertFalse(usuario.is_staff)

        editado = self.client.patch(
            f"/api/v1/admin/usuarios/{usuario.id}/",
            {"rol": Usuario.Rol.VENTAS},
            format="json",
        )
        self.assertEqual(editado.status_code, 200)
        self.assertEqual(editado.data["data"]["rol"], Usuario.Rol.VENTAS)

        estado = self.client.patch(
            f"/api/v1/admin/usuarios/{usuario.id}/estado/",
            {"activo": False},
            format="json",
        )
        self.assertEqual(estado.status_code, 200)
        usuario.refresh_from_db()
        self.assertFalse(usuario.is_active)

    def test_operador_no_puede_gestionar_usuarios(self):
        self.client.force_authenticate(self.operador)
        self.assertEqual(self.client.get("/api/v1/admin/usuarios/").status_code, 403)
        self.assertEqual(
            self.client.post(
                "/api/v1/admin/usuarios/",
                {"email": "x@test.com", "password": CLAVE_TEST, "rol": Usuario.Rol.ADMIN},
                format="json",
            ).status_code,
            403,
        )

    def test_admin_no_puede_desactivar_su_propia_cuenta(self):
        self.client.force_authenticate(self.admin)
        respuesta = self.client.patch(
            f"/api/v1/admin/usuarios/{self.admin.id}/estado/",
            {"activo": False},
            format="json",
        )
        self.assertEqual(respuesta.status_code, 403)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)
