"""Configuración para desarrollo local y pruebas sobre MySQL real."""
import os

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver", "[::1]"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# La suite SIEMPRE corre sobre MySQL/InnoDB (motor real de producción).
# Django crea y destruye esta BD usando DB_USER/DB_PASSWORD de .env.
DATABASES["default"]["TEST"] = {
    "NAME": os.getenv("DB_TEST_NAME", "hilo_y_estilo_test"),
}
