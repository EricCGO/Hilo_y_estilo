"""Errores de aplicación y manejador centralizado de excepciones."""
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

CODE_POR_STATUS = {
    400: "VALIDACION",
    401: "NO_AUTORIZADO",
    403: "PROHIBIDO",
    404: "NO_ENCONTRADO",
    405: "METODO_NO_PERMITIDO",
    409: "CONFLICTO",
    429: "DEMASIADAS_SOLICITUDES",
    500: "ERROR_INTERNO",
}


class AppError(APIException):
    """Error de dominio con código estable para el frontend."""

    def __init__(self, code, message, status_code=status.HTTP_400_BAD_REQUEST, details=None):
        super().__init__(detail=message, code=code)
        self.status_code = status_code
        self.app_code = code
        self.details = details or {}


def build_error(code, message, status_code, details=None):
    payload = {"error": {"code": code, "message": str(message)}}
    if details:
        payload["error"]["details"] = details
    return Response(payload, status=status_code)


def custom_exception_handler(exc, context):
    """Normaliza TODA respuesta de error al envelope { error: { code, message } }."""
    if isinstance(exc, AppError):
        return build_error(
            exc.app_code, exc.detail, exc.status_code, exc.details
        )

    if isinstance(exc, (DjangoValidationError, ValidationError)):
        detail = exc.message_dict if hasattr(exc, "message_dict") else exc.detail
        return build_error("VALIDACION", "Datos inválidos.", 400, detail)

    if isinstance(exc, IntegrityError):
        return build_error("CONFLICTO", "El registro entra en conflicto con datos existentes.", 409)

    if isinstance(exc, Http404):
        return build_error("NO_ENCONTRADO", "Recurso no encontrado.", 404)

    if isinstance(exc, Throttled):
        return build_error(
            "DEMASIADAS_SOLICITUDES",
            "Demasiados intentos. Espera unos segundos antes de continuar.",
            429,
            {"retry_after": getattr(exc, "wait", None)},
        )

    response = exception_handler(exc, context)
    if response is None:
        return build_error("ERROR_INTERNO", "Error interno del servidor.", 500)

    code = exc.detail.code if hasattr(exc, "detail") and hasattr(exc.detail, "code") else None
    if not isinstance(code, str):
        code = CODE_POR_STATUS.get(response.status_code, "ERROR_INTERNO")

    message = (
        exc.detail
        if hasattr(exc, "detail") and isinstance(exc.detail, str)
        else "No se pudo completar la solicitud."
    )
    details = response.data if not isinstance(exc.detail, str) else None
    return build_error(code, message, response.status_code, details)
