"""Emisión, rotación y limpieza de JWT almacenados en cookies httpOnly.

Toda la configuración de cookies vive aquí para que login, refresh y logout
usen exactamente los mismos atributos (path/domain/Secure/SameSite).
"""
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.exceptions import AppError

ACCESS_COOKIE = settings.AUTH_COOKIE_ACCESS_NAME
REFRESH_COOKIE = settings.AUTH_COOKIE_REFRESH_NAME
REFRESH_PATH = settings.AUTH_COOKIE_REFRESH_PATH


def _atributos():
    return {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "domain": settings.AUTH_COOKIE_DOMAIN,
    }


def _atributos_borrado():
    # Django 5 solo acepta path/domain/samesite en delete_cookie.
    return {
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "domain": settings.AUTH_COOKIE_DOMAIN,
    }


def emitir_tokens(usuario):
    refresh = RefreshToken.for_user(usuario)
    return refresh.access_token, refresh


def rotar_refresh(raw_refresh):
    """Valida, bloquea y rota el refresh. Devuelve (access, refresh)."""
    if not raw_refresh:
        raise AppError("NO_AUTORIZADO", "No hay sesión activa.", 401)
    try:
        refresh = RefreshToken(raw_refresh)
        access = refresh.access_token
        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                refresh.blacklist()
            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()
    except (InvalidToken, TokenError):
        raise AppError("NO_AUTORIZADO", "La sesión expiró.", 401) from None
    return access, refresh


def blacklist_refresh(raw_refresh):
    if not raw_refresh:
        return
    try:
        RefreshToken(raw_refresh).blacklist()
    except (InvalidToken, TokenError, AttributeError):
        pass


def set_auth_cookies(response, access, refresh):
    comun = _atributos()
    response.set_cookie(
        ACCESS_COOKIE,
        str(access),
        max_age=int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()),
        path="/",
        **comun,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        str(refresh),
        max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
        path=REFRESH_PATH,
        **comun,
    )
    return response


def clear_auth_cookies(response):
    """Los atributos deben coincidir con los de set_auth_cookies para borrar."""
    comun = _atributos_borrado()
    response.delete_cookie(ACCESS_COOKIE, path="/", **comun)
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_PATH, **comun)
    return response
