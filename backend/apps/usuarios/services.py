"""Reglas de negocio para la gestión de cuentas operativas."""
from apps.core.exceptions import AppError
from .models import Usuario


def cambiar_estado(actor, objetivo, activo):
    """Activa o desactiva una cuenta, impidiendo bloquear la propia sesión."""
    if actor.pk == objetivo.pk:
        raise AppError(
            "PROHIBIDO",
            "No puedes desactivar tu propia cuenta.",
            403,
        )
    objetivo.is_active = activo
    objetivo.save(update_fields=["is_active"])
    return objetivo
