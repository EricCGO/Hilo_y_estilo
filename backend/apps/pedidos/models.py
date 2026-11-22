from django.conf import settings
from django.db import models

from apps.catalogo.models import Producto
from apps.core.models import TimeStampedModel


class Pedido(TimeStampedModel):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        CONFIRMADO = "confirmado", "Confirmado"
        EN_PREPARACION = "en_preparacion", "En preparación"
        ENVIADO = "enviado", "Enviado"
        ENTREGADO = "entregado", "Entregado"
        CANCELADO = "cancelado", "Cancelado"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="pedidos"
    )
    estado = models.CharField(max_length=25, choices=Estado.choices, default=Estado.PENDIENTE)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    direccion_entrega = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100, default="Popayán")
    telefono_contacto = models.CharField(max_length=30)
    notas = models.TextField(blank=True)

    class Meta:
        db_table = "pedido"
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["usuario", "created_at"], name="idx_pedido_usuario"),
            models.Index(fields=["estado"], name="idx_pedido_estado"),
        ]

    def __str__(self):
        return f"Pedido #{self.pk} — {self.usuario.email}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="items_pedido"
    )
    nombre_producto = models.CharField(max_length=150)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    cantidad = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "item_pedido"
        verbose_name = "ítem de pedido"
        verbose_name_plural = "ítems de pedido"
        constraints = [
            models.UniqueConstraint(
                fields=["pedido", "producto"], name="uniq_item_pedido_producto"
            )
        ]

    def __str__(self):
        return f"{self.cantidad} × {self.nombre_producto}"


class MovimientoInventario(models.Model):
    class Tipo(models.TextChoices):
        ENTRADA = "entrada", "Entrada"
        SALIDA = "salida", "Salida"
        AJUSTE = "ajuste", "Ajuste"

    producto = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="movimientos"
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    cantidad = models.IntegerField()
    stock_resultante = models.PositiveIntegerField()
    motivo = models.CharField(max_length=200, blank=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movimientos_inventario",
    )
    pedido = models.ForeignKey(
        Pedido, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="movimientos",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "movimiento_inventario"
        verbose_name = "movimiento de inventario"
        verbose_name_plural = "movimientos de inventario"
        ordering = ["-created_at"]
