from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalogo.models import Categoria, Producto
from apps.pedidos.models import Pedido
from apps.pedidos.services import crear_pedido
from apps.usuarios.models import Usuario
from .models import Envio


class EnvioTests(TestCase):
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
        categoria = Categoria.objects.create(nombre="Hilos", slug="hilos")
        self.producto = Producto.objects.create(
            categoria=categoria, nombre="Hilo A", slug="hilo-a",
            sku="A-1", precio="1000.00", stock=10,
        )
        self.pedido = crear_pedido(
            self.cliente,
            {
                "items": [{"producto_id": self.producto.id, "cantidad": 2}],
                "direccion_entrega": "Calle 5 # 10-20",
                "telefono_contacto": "3001234567",
            },
        )
        self.client.force_authenticate(self.admin)

    def transicion(self, estado):
        return self.client.patch(
            f"/api/v1/admin/pedidos/{self.pedido.id}/estado/",
            {"estado": estado},
            format="json",
        )

    def test_flujo_completo_hasta_entrega(self):
        self.assertEqual(self.transicion("confirmado").status_code, 200)
        self.assertEqual(self.transicion("en_preparacion").status_code, 200)
        self.assertEqual(self.transicion("enviado").status_code, 200)

        envio = Envio.objects.get(pedido=self.pedido)
        self.assertEqual(envio.estado, Envio.Estado.PENDIENTE)

        en_transito = self.client.patch(
            f"/api/v1/admin/envios/{envio.id}/", {"estado": "en_transito"}, format="json"
        )
        self.assertEqual(en_transito.status_code, 200)
        envio.refresh_from_db()
        self.assertIsNotNone(envio.fecha_despacho)

        entregado = self.client.patch(
            f"/api/v1/admin/envios/{envio.id}/", {"estado": "entregado"}, format="json"
        )
        self.assertEqual(entregado.status_code, 200)
        envio.refresh_from_db()
        self.pedido.refresh_from_db()
        self.assertIsNotNone(envio.fecha_entrega)
        self.assertEqual(self.pedido.estado, Pedido.Estado.ENTREGADO)

    def test_transicion_invalida_de_envio(self):
        self.transicion("confirmado")
        self.transicion("en_preparacion")
        self.transicion("enviado")
        envio = Envio.objects.get(pedido=self.pedido)
        respuesta = self.client.patch(
            f"/api/v1/admin/envios/{envio.id}/", {"estado": "entregado"}, format="json"
        )
        self.assertEqual(respuesta.status_code, 409)
        self.assertEqual(respuesta.data["error"]["code"], "ESTADO_INVALIDO")

    def test_empleado_logistica_solo_accede_a_envios(self):
        empleado = Usuario.objects.create_user(
            username="log@test.com", email="log@test.com",
            password="claveSegura123", rol=Usuario.Rol.LOGISTICA,
        )
        self.client.force_authenticate(empleado)
        self.assertEqual(self.client.get("/api/v1/admin/envios/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/admin/productos/").status_code, 403)

    def test_actualizar_guia_y_transportadora(self):
        self.transicion("confirmado")
        self.transicion("en_preparacion")
        self.transicion("enviado")
        envio = Envio.objects.get(pedido=self.pedido)
        respuesta = self.client.patch(
            f"/api/v1/admin/envios/{envio.id}/",
            {
                "transportadora": "Servientrega",
                "numero_guia": "GUIA-123",
                "fecha_estimada": "2026-11-30",
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, 200)
        envio.refresh_from_db()
        self.assertEqual(envio.transportadora, "Servientrega")
        self.assertEqual(envio.numero_guia, "GUIA-123")
        self.assertEqual(str(envio.fecha_estimada), "2026-11-30")

    def test_no_se_pueden_crear_dos_envios_para_un_pedido(self):
        datos = {
            "pedido_id": self.pedido.id,
            "transportadora": "Servientrega",
            "numero_guia": "GUIA-001",
        }
        primera = self.client.post("/api/v1/admin/envios/crear/", datos, format="json")
        self.assertEqual(primera.status_code, 201)
        segunda = self.client.post(
            "/api/v1/admin/envios/crear/",
            {**datos, "numero_guia": "GUIA-002"},
            format="json",
        )
        self.assertEqual(segunda.status_code, 409)