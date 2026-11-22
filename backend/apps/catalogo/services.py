"""Lógica de negocio del catálogo (independiente de HTTP)."""
from django.db import transaction
from django.db.models import F

from apps.core.exceptions import AppError
from .models import Producto


def ajustar_stock(producto_id, cantidad, motivo="", actor=None):
    """Ajusta el stock en una transacción y deja trazabilidad.

    `cantidad` puede ser positiva (entrada) o negativa (salida).
    """
    if cantidad == 0:
        raise AppError("VALIDACION", "La cantidad no puede ser cero.", 400)

    with transaction.atomic():
        producto = Producto.objects.select_for_update().filter(pk=producto_id).first()
        if not producto:
            raise AppError("NO_ENCONTRADO", "Producto no encontrado.", 404)

        stock_final = producto.stock + cantidad
        if stock_final < 0:
            raise AppError(
                "CONFLICTO",
                "El ajuste dejaría el stock en negativo.",
                409,
                {"stock_actual": producto.stock, "ajuste": cantidad},
            )

        Producto.objects.filter(pk=producto.pk).update(stock=F("stock") + cantidad)

        from apps.pedidos.models import MovimientoInventario

        MovimientoInventario.objects.create(
            producto=producto,
            tipo=(
                MovimientoInventario.Tipo.ENTRADA
                if cantidad > 0
                else MovimientoInventario.Tipo.SALIDA
            ),
            cantidad=cantidad,
            stock_resultante=stock_final,
            motivo=motivo or "Ajuste manual de inventario",
            usuario=actor,
        )

    producto.refresh_from_db()
    return producto
