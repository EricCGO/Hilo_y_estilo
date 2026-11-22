from django.db import models

from apps.core.models import TimeStampedModel
from apps.pedidos.models import Pedido


class Envio(TimeStampedModel):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        PREPARANDO = "preparando", "Preparando"
        EN_TRANSITO = "en_transito", "En tránsito"
        ENTREGADO = "entregado", "Entregado"
        DEVUELTO = "devuelto", "Devuelto"

    pedido = models.OneToOneField(
        Pedido, on_delete=models.CASCADE, related_name="envio"
    )
    transportadora = models.CharField(max_length=100, default="Por asignar")
    numero_guia = models.CharField(max_length=80, blank=True, null=True, unique=True)
    estado = models.CharField(max_length=25, choices=Estado.choices, default=Estado.PENDIENTE)
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha_despacho = models.DateTimeField(blank=True, null=True)
    fecha_estimada = models.DateField(blank=True, null=True)
    fecha_entrega = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "envio"
        verbose_name = "envío"
        verbose_name_plural = "envíos"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Envío pedido #{self.pedido_id} — {self.estado}"

    @property
    def usuario(self):
        """Necesario para el permiso IsOwnerOrAdmin."""
        return self.pedido.usuario
