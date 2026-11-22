"""Throttling de DRF para endpoints sensibles de autenticación."""
from rest_framework.throttling import SimpleRateThrottle


class _ThrottlePorIP(SimpleRateThrottle):
    """Identifica al cliente por IP (respetando NUM_PROXIES de DRF)."""

    def get_cache_key(self, request, view):
        identificador = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": identificador}


class LoginThrottle(_ThrottlePorIP):
    scope = "login"


class RegistroThrottle(_ThrottlePorIP):
    scope = "register"


class RefreshThrottle(_ThrottlePorIP):
    scope = "refresh"
