"""Reglas de negocio de despachos y guías."""
from django.db import transaction
from django.utils import timezone

from apps.core.exceptions import AppError
from apps.pedidos.models import Pedido
from .models import Envio

TRANSICIONES = {
    Envio.Estado.PENDIENTE: {Envio.Estado.PREPARANDO, Envio.Estado.EN_TRANSITO},
    Envio.Estado.PREPARANDO: {Envio.Estado.EN_TRANSITO},
    Envio.Estado.EN_TRANSITO: {Envio.Estado.ENTREGADO, Envio.Estado.DEVUELTO},
    Envio.Estado.ENTREGADO: set(),
    Envio.Estado.DEVUELTO: set(),
}


def crear_envio(pedido_id, datos):
    """Crea el envío de un pedido, evitando duplicados."""
    pedido = Pedido.objects.filter(pk=pedido_id).first()
    if not pedido:
        raise AppError("NO_ENCONTRADO", "Pedido no encontrado.", 404)
    if Envio.objects.filter(pedido_id=pedido_id).exists():
        raise AppError(
            "CONFLICTO", "Este pedido ya tiene un envío registrado.", 409
        )
    return Envio.objects.create(pedido=pedido, **datos)


def cambiar_estado(envio, nuevo_estado, campos=None):
    """Valida la transición, actualiza fechas/guía y sincroniza el pedido."""
    if nuevo_estado != envio.estado:
        permitidos = TRANSICIONES.get(envio.estado, set())
        if nuevo_estado not in permitidos:
            raise AppError(
                "ESTADO_INVALIDO",
                f"No se puede cambiar de '{envio.estado}' a '{nuevo_estado}'.",
                409,
                {"estado_actual": envio.estado, "permitidos": sorted(permitidos)},
            )

    campos = dict(campos or {})
    if "numero_guia" in campos and not campos["numero_guia"]:
        campos["numero_guia"] = None

    with transaction.atomic():
        envio = Envio.objects.select_for_update().select_related("pedido").get(pk=envio.pk)
        ahora = timezone.now()

        if nuevo_estado == Envio.Estado.EN_TRANSITO and not envio.fecha_despacho:
            envio.fecha_despacho = ahora
        if nuevo_estado == Envio.Estado.ENTREGADO:
            envio.fecha_entrega = ahora

        envio.estado = nuevo_estado
        for campo, valor in campos.items():
            setattr(envio, campo, valor)
        envio.save()

        if nuevo_estado == Envio.Estado.ENTREGADO and envio.pedido.estado != Pedido.Estado.ENTREGADO:
            pedido = Pedido.objects.select_for_update().get(pk=envio.pedido_id)
            pedido.estado = Pedido.Estado.ENTREGADO
            pedido.save(update_fields=["estado", "updated_at"])

    envio.refresh_from_db()
    return envio
