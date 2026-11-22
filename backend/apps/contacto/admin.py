from django.contrib import admin

from .models import MensajeContacto


@admin.register(MensajeContacto)
class MensajeContactoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "leido", "created_at")
    list_filter = ("leido",)
    search_fields = ("nombre", "email")
