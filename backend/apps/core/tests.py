"""Garantías del entorno de pruebas y del envelope único de la API."""
from django.db import connection, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalogo.models import Categoria, Producto
from apps.envios.models import Envio
from apps.pedidos.models import Pedido
from apps.usuarios.models import Usuario


class MotorMySQLTests(TestCase):
    def test_las_tablas_usan_innodb(self):
        if connection.vendor != "mysql":
            self.skipTest("Esta comprobación aplica solo a MySQL.")
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT ENGINE FROM information_schema.TABLES "
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'producto'"
            )
            fila = cursor.fetchone()
        self.assertIsNotNone(fila)
        self.assertEqual(fila[0].lower(), "innodb")

    def test_select_for_update_funciona_en_mysql(self):
        categoria = Categoria.objects.create(nombre="Hilos", slug="hilos-test")
        producto = Producto.objects.create(
            categoria=categoria,
            nombre="Hilo bloqueado",
            slug="hilo-bloqueado-test",
            sku="BLOQ-TEST-1",
            precio="1000.00",
            stock=5,
        )
        with transaction.atomic():
            bloqueado = Producto.objects.select_for_update().get(pk=producto.pk)
            self.assertEqual(bloqueado.stock, 5)


class EnvelopeAPITests(TestCase):
    """Toda respuesta de éxito debe traer la clave `data`."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            username="envelope@test.com", email="envelope@test.com",
            password="claveEnvelope123",
        )
        self.categoria = Categoria.objects.create(nombre="Hilos", slug="hilos-envelope")
        self.producto = Producto.objects.create(
            categoria=self.categoria, nombre="Hilo", slug="hilo-envelope",
            sku="ENV-1", precio="1000.00", stock=5,
        )
        self.pedido = Pedido.objects.create(
            usuario=self.usuario, estado=Pedido.Estado.PENDIENTE,
            subtotal="1000.00", costo_envio="0", total="1000.00",
            direccion_entrega="Calle 1", telefono_contacto="3000000000",
        )
        self.envio = Envio.objects.create(
            pedido=self.pedido, transportadora="Servientrega"
        )

    def test_endpoints_publicos_usa_data(self):
        rutas = [
            "/api/v1/health/",
            "/api/v1/categorias/",
            "/api/v1/productos/",
            f"/api/v1/productos/{self.producto.slug}/",
        ]
        for ruta in rutas:
            with self.subTest(ruta=ruta):
                self.assertIn("data", self.client.get(ruta).data)

        respuesta = self.client.post(
            "/api/v1/contacto/",
            {"nombre": "Ana", "email": "ana@test.com", "mensaje": "Hola"},
            format="json",
        )
        self.assertIn("data", respuesta.data)

    def test_endpoints_autenticados_usan_data(self):
        self.client.force_authenticate(self.usuario)
        for ruta in [
            "/api/v1/auth/me/",
            f"/api/v1/pedidos/{self.pedido.id}/",
            f"/api/v1/envios/{self.envio.id}/",
        ]:
            with self.subTest(ruta=ruta):
                self.assertIn("data", self.client.get(ruta).data)
