from django.contrib import admin

from .models import Categoria, Producto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug", "activa")
    list_filter = ("activa",)
    prepopulated_fields = {"slug": ("nombre",)}


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "sku", "categoria", "precio", "stock", "activo")
    list_filter = ("categoria", "activo")
    search_fields = ("nombre", "sku")
    prepopulated_fields = {"slug": ("nombre",)}
