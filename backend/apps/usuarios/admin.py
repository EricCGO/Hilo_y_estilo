from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("email", "nombre", "rol", "ciudad", "is_active")
    list_filter = ("rol", "ciudad", "is_active")
    ordering = ("email",)
    fieldsets = UserAdmin.fieldsets + (
        ("Datos de Hilo y Estilo", {
            "fields": ("rol", "telefono", "direccion", "ciudad", "barrio", "nombre_taller")
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Datos de Hilo y Estilo", {"fields": ("email", "rol")}),
    )
