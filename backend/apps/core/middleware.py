"""Defensa adicional: verificación de Origin para peticiones con cookies."""
from django.conf import settings
from django.http import JsonResponse


class OriginCheckMiddleware:
    """En métodos de escritura exige un Origin permitido cuando el cliente lo envía."""

    WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (
            request.method in self.WRITE_METHODS
            and not request.path.startswith("/django-admin/")
        ):
            origin = request.headers.get("Origin")
            if origin and origin not in settings.CORS_ALLOWED_ORIGINS:
                return JsonResponse(
                    {
                        "error": {
                            "code": "PROHIBIDO",
                            "message": "Origen no permitido.",
                        }
                    },
                    status=403,
                )
        return self.get_response(request)
