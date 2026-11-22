import io
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.usuarios.models import Usuario
from .models import Categoria, Producto


class FixtureInicialTests(TestCase):
    fixtures = ["catalogo_inicial.json"]

    def test_semilla_carga_catalogo_sin_secretos(self):
        self.assertEqual(Categoria.objects.count(), 5)
        self.assertEqual(Producto.objects.count(), 3)
        self.assertEqual(Producto.objects.get(sku="SKU-TEL-001").stock, 25)
        self.assertEqual(Producto.objects.get(sku="SKU-HER-001").stock, 15)


class CatalogoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.categoria = Categoria.objects.create(
            nombre="Hilos", slug="hilos", activa=True
        )

    def test_listado_publico_oculta_productos_inactivos(self):
        Producto.objects.create(
            categoria=self.categoria, nombre="Visible", slug="visible",
            sku="VIS-1", precio="1000.00", stock=10, activo=True,
        )
        Producto.objects.create(
            categoria=self.categoria, nombre="Oculto", slug="oculto",
            sku="Ocul-1", precio="1000.00", stock=10, activo=False,
        )
        respuesta = self.client.get("/api/v1/productos/")
        self.assertEqual(respuesta.status_code, 200)
        nombres = [p["nombre"] for p in respuesta.data["data"]]
        self.assertIn("Visible", nombres)
        self.assertNotIn("Oculto", nombres)

    def test_filtro_por_categoria(self):
        Producto.objects.create(
            categoria=self.categoria, nombre="Hilo A", slug="hilo-a",
            sku="A-1", precio="1000.00", stock=10,
        )
        respuesta = self.client.get("/api/v1/productos/?categoria=hilos")
        self.assertEqual(respuesta.status_code, 200, respuesta.data)
        self.assertEqual(len(respuesta.data["data"]), 1, respuesta.data)


class AdminCatalogoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_user(
            username="admin@test.com", email="admin@test.com",
            password="claveSegura123", rol=Usuario.Rol.ADMIN,
        )
        self.cliente = Usuario.objects.create_user(
            username="cliente@test.com", email="cliente@test.com",
            password="claveSegura123",
        )
        self.categoria = Categoria.objects.create(nombre="Hilos", slug="hilos")
        self.producto = Producto.objects.create(
            categoria=self.categoria, nombre="Hilo A", slug="hilo-a",
            sku="A-1", precio="1000.00", stock=10, stock_minimo=5,
        )

    def test_cliente_no_puede_acceder_al_admin(self):
        self.client.force_authenticate(self.cliente)
        self.assertEqual(self.client.get("/api/v1/admin/productos/").status_code, 403)
        self.assertEqual(self.client.get("/api/v1/admin/categorias/").status_code, 403)

    def test_empleado_inventario_solo_accede_a_catalogo(self):
        empleado = Usuario.objects.create_user(
            username="inv@test.com", email="inv@test.com",
            password="claveSegura123", rol=Usuario.Rol.INVENTARIO,
        )
        self.client.force_authenticate(empleado)
        self.assertEqual(self.client.get("/api/v1/admin/productos/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/admin/categorias/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/admin/pedidos/").status_code, 403)

    def test_crear_producto_con_imagen_multipart(self):
        buffer = io.BytesIO()
        Image.new("RGB", (2, 2), (212, 175, 55)).save(buffer, format="PNG")
        png = buffer.getvalue()
        with tempfile.TemporaryDirectory() as temporal:
            with override_settings(MEDIA_ROOT=temporal):
                self.client.force_authenticate(self.admin)
                respuesta = self.client.post(
                    "/api/v1/admin/productos/",
                    {
                        "nombre": "Producto con imagen",
                        "slug": "producto-con-imagen",
                        "sku": "IMG-1",
                        "categoria": self.categoria.id,
                        "precio": "1000.00",
                        "stock": "3",
                        "stock_minimo": "1",
                        "imagen": SimpleUploadedFile("hilo.png", png, content_type="image/png"),
                    },
                    format="multipart",
                )
                self.assertEqual(respuesta.status_code, 201, respuesta.data)
                self.assertTrue(respuesta.data["data"]["imagen_url"])
                self.assertTrue(
                    Producto.objects.get(sku="IMG-1").imagen.name.startswith("productos/")
                )

    def test_admin_puede_crear_categoria(self):
        self.client.force_authenticate(self.admin)
        respuesta = self.client.post(
            "/api/v1/admin/categorias/",
            {"nombre": "Tintes", "slug": "tintes"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, 201)
        self.assertTrue(Categoria.objects.filter(slug="tintes").exists())

    def test_ajuste_de_stock_positivo_y_negativo(self):
        self.client.force_authenticate(self.admin)
        subida = self.client.patch(
            f"/api/v1/admin/productos/{self.producto.id}/stock/",
            {"cantidad": 5, "motivo": "Compra a proveedor"},
            format="json",
        )
        self.assertEqual(subida.status_code, 200)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 15)

        bajada = self.client.patch(
            f"/api/v1/admin/productos/{self.producto.id}/stock/",
            {"cantidad": -20, "motivo": "Merma"},
            format="json",
        )
        self.assertEqual(bajada.status_code, 409)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 15)
        self.assertEqual(self.producto.movimientos.count(), 1)
        self.assertEqual(self.producto.movimientos.first().usuario, self.admin)
