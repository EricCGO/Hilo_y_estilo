from django.contrib import admin

from .models import ItemPedido, MovimientoInventario, Pedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0
    readonly_fields = ("nombre_producto", "precio_unitario", "subtotal")


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "estado", "total", "ciudad", "created_at")
    list_filter = ("estado", "ciudad")
    search_fields = ("usuario__email", "telefono_contacto")
    inlines = [ItemPedidoInline]


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ("producto", "tipo", "cantidad", "stock_resultante", "created_at")
    list_filter = ("tipo",)
