from apps.core.models import TimeStampedModel
from django.db import models


class MensajeContacto(TimeStampedModel):
    nombre = models.CharField(max_length=150)
    email = models.EmailField()
    mensaje = models.TextField()
    leido = models.BooleanField(default=False)

    class Meta:
        db_table = "mensaje_contacto"
        verbose_name = "mensaje de contacto"
        verbose_name_plural = "mensajes de contacto"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.nombre} <{self.email}>"
