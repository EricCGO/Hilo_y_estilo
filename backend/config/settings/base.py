"""Configuración base compartida por todos los entornos."""
from datetime import timedelta
from pathlib import Path

import pymysql
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv
import os

pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


def env_list(key, default=""):
    return [item.strip() for item in os.getenv(key, default).split(",") if item.strip()]


# Fail-fast: sin secretos configurados el proceso no arranca.
REQUIRED_ENV = ("SECRET_KEY", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT")
_faltantes = [clave for clave in REQUIRED_ENV if not os.getenv(clave)]
if _faltantes:
    raise ImproperlyConfigured(
        "Faltan variables de entorno obligatorias: " + ", ".join(_faltantes)
    )

SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceros
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    # Dominios propios
    "apps.core",
    "apps.usuarios",
    "apps.catalogo",
    "apps.pedidos",
    "apps.envios",
    "apps.contacto",
    "apps.admin_panel",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.core.middleware.OriginCheckMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ["DB_PORT"],
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_USER_MODEL = "usuarios.Usuario"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
FIXTURE_DIRS = [BASE_DIR / "fixtures"]

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "hilo-estilo-ratelimit",
    }
}

# ---------------------------------------------------------------- DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.core.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 12,
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    # DRF throttling: las vistas de auth declaran su clase de throttle.
    "DEFAULT_THROTTLE_RATES": {
        "login": os.getenv("THROTTLE_LOGIN_RATE", "10/min"),
        "register": os.getenv("THROTTLE_REGISTER_RATE", "5/min"),
        "refresh": os.getenv("THROTTLE_REFRESH_RATE", "30/min"),
    },
    # Detrás de un proxy inverso, ajusta a 1 para usar X-Forwarded-For.
    "NUM_PROXIES": int(os.getenv("DRF_NUM_PROXIES", "0")),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("JWT_ACCESS_MINUTES", "15"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "UPDATE_LAST_LOGIN": True,
}

CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ---------------------------------------------------------------- Cookies JWT
AUTH_COOKIE_ACCESS_NAME = os.getenv("AUTH_COOKIE_ACCESS_NAME", "access_token")
AUTH_COOKIE_REFRESH_NAME = os.getenv("AUTH_COOKIE_REFRESH_NAME", "refresh_token")
AUTH_COOKIE_REFRESH_PATH = os.getenv("AUTH_COOKIE_REFRESH_PATH", "/api/v1/auth/")
AUTH_COOKIE_DOMAIN = os.getenv("AUTH_COOKIE_DOMAIN") or None
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "Lax")
if AUTH_COOKIE_SAMESITE not in ("Lax", "Strict", "None"):
    raise ImproperlyConfigured("AUTH_COOKIE_SAMESITE debe ser Lax, Strict o None.")

# Secure por defecto en producción; se puede forzar en entornos de prueba HTTPS.
AUTH_COOKIE_SECURE = (
    os.getenv("AUTH_COOKIE_SECURE", "").lower() == "true" or not DEBUG
)
if AUTH_COOKIE_SAMESITE == "None" and not AUTH_COOKIE_SECURE:
    raise ImproperlyConfigured("SameSite=None requiere AUTH_COOKIE_SECURE=True.")

SPECTACULAR_SETTINGS = {
    "TITLE": "Hilo y Estilo API",
    "DESCRIPTION": "API REST para insumos textiles artesanales de Popayán, Cauca.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
