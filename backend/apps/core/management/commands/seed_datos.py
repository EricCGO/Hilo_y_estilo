"""Carga semilla limpia: catálogo desde fixture + cuentas desde variables de entorno.

No guarda contraseñas en el repositorio. Los datos del catálogo viven en
`backend/fixtures/catalogo_inicial.json` (sin usuarios ni secretos).
"""
import os

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.usuarios.models import Usuario


class Command(BaseCommand):
    help = "Carga el catálogo inicial y crea el usuario admin (y opcionalmente demo)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--demo",
            action="store_true",
            help="Crea también usuarios de prueba usando SEED_DEMO_PASSWORD.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        call_command("loaddata", "catalogo_inicial", verbosity=0)
        self.stdout.write("Catálogo cargado desde fixtures/catalogo_inicial.json")

        email = os.getenv("SEED_ADMIN_EMAIL", "admin@hiloystilo.local")
        password = os.getenv("SEED_ADMIN_PASSWORD")
        if not password:
            raise CommandError(
                "Define SEED_ADMIN_PASSWORD en backend/.env antes de ejecutar el seed."
            )

        admin, creado = Usuario.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": "Administrador",
                "rol": Usuario.Rol.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if creado:
            admin.set_password(password)
            admin.save()
        self.stdout.write(f"Admin {email}: {'creado' if creado else 'existente'}")

        if options["demo"]:
            demo_password = os.getenv("SEED_DEMO_PASSWORD")
            if not demo_password:
                self.stdout.write(
                    self.style.WARNING(
                        "Omitidos usuarios demo: define SEED_DEMO_PASSWORD en .env."
                    )
                )
                return
            demos = [
                ("cliente.demo@hiloystilo.local", Usuario.Rol.CLIENTE, "Taller Demo"),
                ("inventario.demo@hiloystilo.local", Usuario.Rol.INVENTARIO, "Operador Inventario"),
                ("logistica.demo@hiloystilo.local", Usuario.Rol.LOGISTICA, "Operador Logística"),
                ("ventas.demo@hiloystilo.local", Usuario.Rol.VENTAS, "Operador Ventas"),
            ]
            for correo, rol, nombre in demos:
                usuario, creado = Usuario.objects.get_or_create(
                    email=correo,
                    defaults={
                        "username": correo,
                        "first_name": nombre,
                        "rol": rol,
                    },
                )
                if creado:
                    usuario.set_password(demo_password)
                    usuario.save()
                self.stdout.write(f"Demo {correo}: {'creado' if creado else 'existente'}")

        self.stdout.write(self.style.SUCCESS("Seed completado."))
