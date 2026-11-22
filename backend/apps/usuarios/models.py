from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel


class Usuario(AbstractUser, TimeStampedModel):
    """Usuario con rol de negocio y datos del taller en Popayán."""

    class Rol(models.TextChoices):
        CLIENTE = "cliente", "Cliente"
        ADMIN = "admin_general", "Administrador general"
        INVENTARIO = "operador_inventario", "Operador de inventario"
        LOGISTICA = "operador_logistica", "Operador de logística"
        VENTAS = "operador_ventas", "Operador de ventas"

    email = models.EmailField(_("correo electrónico"), unique=True)
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.CLIENTE)
    telefono = models.CharField(max_length=30, blank=True)
    direccion = models.CharField(max_length=255, blank=True)
    ciudad = models.CharField(max_length=100, default="Popayán")
    barrio = models.CharField(max_length=100, blank=True)
    nombre_taller = models.CharField(max_length=150, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "usuario"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.email

    @property
    def nombre(self):
        return self.get_full_name() or self.username
