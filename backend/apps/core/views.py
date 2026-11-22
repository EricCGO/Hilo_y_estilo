"""Endpoint de salud del sistema."""
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.exceptions import build_error


@api_view(["GET"])
@permission_classes([AllowAny])
def health_view(_request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db = "ok"
    except Exception:  # noqa: BLE001 - el healthcheck debe degradar, no derribar
        db = "error"
        return build_error("BD_NO_DISPONIBLE", "La base de datos no responde.", 503)

    return Response({"data": {"status": "ok", "db": db}})
