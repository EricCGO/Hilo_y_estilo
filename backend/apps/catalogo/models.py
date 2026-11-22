from django.db import models
from django.db.models import Q

from apps.core.models import TimeStampedModel


class Categoria(TimeStampedModel):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = "categoria"
        verbose_name = "categoría"
        verbose_name_plural = "categorías"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Producto(TimeStampedModel):
    categoria = models.ForeignKey(
        Categoria, on_delete=models.PROTECT, related_name="productos"
    )
    nombre = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)
    descripcion = models.TextField(blank=True)
    sku = models.CharField(max_length=50, unique=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=5)
    activo = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to="productos/", blank=True)
    atributos = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "producto"
        verbose_name = "producto"
        verbose_name_plural = "productos"
        ordering = ["nombre"]
        constraints = [
            models.CheckConstraint(
                condition=Q(precio__gte=0), name="producto_precio_no_negativo"
            )
        ]
        indexes = [
            models.Index(fields=["categoria", "activo"], name="idx_producto_cat_act"),
            models.Index(fields=["nombre"], name="idx_producto_nombre"),
        ]

    def __str__(self):
        return self.nombre

    @property
    def agotado(self):
        return self.stock <= 0

    @property
    def stock_bajo(self):
        return self.stock <= self.stock_minimo
