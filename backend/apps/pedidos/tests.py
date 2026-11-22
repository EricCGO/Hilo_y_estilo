from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalogo.models import Categoria, Producto
from apps.usuarios.models import Usuario
from .models import Pedido


class PedidoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            username="cliente@ejemplo.com",
            email="cliente@ejemplo.com",
            password="claveSegura123",
        )
        self.client.force_authenticate(self.usuario)
        categoria = Categoria.objects.create(nombre="Hilos", slug="hilos")
        self.producto = Producto.objects.create(
            categoria=categoria, nombre="Hilo A", slug="hilo-a",
            sku="A-1", precio="1000.00", stock=5, stock_minimo=2,
        )

    def payload(self, cantidad=2):
        return {
            "items": [{"producto_id": self.producto.id, "cantidad": cantidad}],
            "direccion_entrega": "Calle 5 # 10-20",
            "ciudad": "Popayán",
            "telefono_contacto": "3001234567",
        }

    def test_vendedor_solo_accede_a_ventas(self):
        vendedor = Usuario.objects.create_user(
            username="ven@test.com", email="ven@test.com",
            password="claveSegura123", rol=Usuario.Rol.VENTAS,
        )
        self.client.force_authenticate(vendedor)
        self.assertEqual(self.client.get("/api/v1/admin/pedidos/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/admin/envios/").status_code, 403)

    def test_crear_pedido_descuenta_stock_y_calcula_total(self):
        respuesta = self.client.post("/api/v1/pedidos/", self.payload(), format="json")
        self.assertEqual(respuesta.status_code, 201)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 3)
        pedido = Pedido.objects.get(pk=respuesta.data["data"]["id"])
        self.assertEqual(pedido.total, Decimal("2000.00"))
        self.assertEqual(pedido.items.count(), 1)
        self.assertEqual(self.producto.movimientos.first().usuario, self.usuario)

    def test_stock_insuficiente_devuelve_409(self):
        respuesta = self.client.post(
            "/api/v1/pedidos/", self.payload(cantidad=99), format="json"
        )
        self.assertEqual(respuesta.status_code, 409)
        self.assertEqual(respuesta.data["error"]["code"], "STOCK_INSUFICIENTE")
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 5)
        self.assertEqual(Pedido.objects.count(), 0)

    def test_cancelar_pedido_devuelve_stock(self):
        respuesta = self.client.post("/api/v1/pedidos/", self.payload(), format="json")
        pedido_id = respuesta.data["data"]["id"]
        cancelacion = self.client.post(f"/api/v1/pedidos/{pedido_id}/cancelar/")
        self.assertEqual(cancelacion.status_code, 200)
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.stock, 5)
        self.assertEqual(
            Pedido.objects.get(pk=pedido_id).estado, Pedido.Estado.CANCELADO
        )
        movimientos = list(self.producto.movimientos.order_by("id"))
        self.assertEqual(movimientos[-1].tipo, "entrada")
        self.assertEqual(movimientos[-1].usuario, self.usuario)
