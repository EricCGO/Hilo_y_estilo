"""Solo diagnóstico aislado: ejecuta la suite en SQLite en memoria.

NO es la configuración oficial de pruebas. Usa:
    DJANGO_SETTINGS_MODULE=config.settings.sqlite venv/bin/python manage.py test
"""
from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

DATABASES["default"] = {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": ":memory:",
}
