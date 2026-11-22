from django.contrib import admin

from .models import Envio


@admin.register(Envio)
class EnvioAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido", "transportadora", "numero_guia", "estado")
    list_filter = ("estado", "transportadora")
    search_fields = ("numero_guia", "pedido__usuario__email")
