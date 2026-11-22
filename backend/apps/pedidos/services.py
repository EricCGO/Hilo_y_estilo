"""Lógica de negocio de pedidos: stock seguro y máquinas de estado."""
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from apps.catalogo.models import Producto
from apps.core.exceptions import AppError
from .models import MovimientoInventario, Pedido

TRANSICIONES = {
    Pedido.Estado.PENDIENTE: {Pedido.Estado.CONFIRMADO, Pedido.Estado.CANCELADO},
    Pedido.Estado.CONFIRMADO: {
        Pedido.Estado.EN_PREPARACION,
        Pedido.Estado.CANCELADO,
    },
    Pedido.Estado.EN_PREPARACION: {Pedido.Estado.ENVIADO},
    Pedido.Estado.ENVIADO: {Pedido.Estado.ENTREGADO},
    Pedido.Estado.ENTREGADO: set(),
    Pedido.Estado.CANCELADO: set(),
}


def crear_pedido(usuario, datos):
    """Crea pedido e ítems en una transacción, bloqueando filas de stock."""
    items = datos["items"]
    ids = [item["producto_id"] for item in items]

    with transaction.atomic():
        productos = {
            producto.pk: producto
            for producto in Producto.objects.select_for_update().filter(
                pk__in=ids, activo=True
            )
        }
        if len(productos) != len(ids):
            faltantes = set(ids) - set(productos)
            raise AppError(
                "NO_ENCONTRADO",
                "Uno o más productos no están disponibles.",
                404,
                {"productos_no_disponibles": list(faltantes)},
            )

        lineas = []
        subtotal = Decimal("0")
        for item in items:
            producto = productos[item["producto_id"]]
            cantidad = item["cantidad"]
            if producto.stock < cantidad:
                raise AppError(
                    "STOCK_INSUFICIENTE",
                    f"Stock insuficiente para {producto.nombre}.",
                    409,
                    {
                        "producto_id": producto.pk,
                        "disponible": producto.stock,
                        "solicitado": cantidad,
                    },
                )
            linea_subtotal = producto.precio * cantidad
            subtotal += linea_subtotal
            lineas.append((producto, cantidad, linea_subtotal))

        pedido = Pedido.objects.create(
            usuario=usuario,
            subtotal=subtotal,
            costo_envio=Decimal("0"),
            total=subtotal,
            direccion_entrega=datos["direccion_entrega"],
            ciudad=datos.get("ciudad", "Popayán"),
            telefono_contacto=datos["telefono_contacto"],
            notas=datos.get("notas", ""),
        )

        from .models import ItemPedido

        ItemPedido.objects.bulk_create(
            [
                ItemPedido(
                    pedido=pedido,
                    producto=producto,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio,
                    cantidad=cantidad,
                    subtotal=linea_subtotal,
                )
                for producto, cantidad, linea_subtotal in lineas
            ]
        )

        for producto, cantidad, _ in lineas:
            Producto.objects.filter(pk=producto.pk).update(
                stock=F("stock") - cantidad
            )
            MovimientoInventario.objects.create(
                producto=producto,
                tipo=MovimientoInventario.Tipo.SALIDA,
                cantidad=-cantidad,
                stock_resultante=producto.stock - cantidad,
                motivo=f"Venta pedido #{pedido.pk}",
                pedido=pedido,
                usuario=usuario,
            )

    return pedido


def cancelar_pedido(pedido, actor=None):
    """Cancela un pedido pendiente/confirmado y devuelve el stock."""
    if pedido.estado not in (Pedido.Estado.PENDIENTE, Pedido.Estado.CONFIRMADO):
        raise AppError(
            "ESTADO_INVALIDO",
            "Este pedido ya no puede cancelarse.",
            409,
            {"estado_actual": pedido.estado},
        )

    with transaction.atomic():
        pedido = Pedido.objects.select_for_update().get(pk=pedido.pk)
        for item in pedido.items.select_related("producto").select_for_update():
            producto = Producto.objects.select_for_update().get(pk=item.producto_id)
            stock_final = producto.stock + item.cantidad
            Producto.objects.filter(pk=producto.pk).update(stock=F("stock") + item.cantidad)
            MovimientoInventario.objects.create(
                producto=producto,
                tipo=MovimientoInventario.Tipo.ENTRADA,
                cantidad=item.cantidad,
                stock_resultante=stock_final,
                motivo=f"Cancelación pedido #{pedido.pk}",
                pedido=pedido,
                usuario=actor,
            )
        pedido.estado = Pedido.Estado.CANCELADO
        pedido.save(update_fields=["estado", "updated_at"])
    return pedido


def cambiar_estado(pedido, nuevo_estado):
    """Valida la transición y sincroniza el envío cuando corresponde."""
    permitidos = TRANSICIONES.get(pedido.estado, set())
    if nuevo_estado not in permitidos:
        raise AppError(
            "ESTADO_INVALIDO",
            f"No se puede cambiar de '{pedido.estado}' a '{nuevo_estado}'.",
            409,
            {"estado_actual": pedido.estado, "permitidos": sorted(permitidos)},
        )

    with transaction.atomic():
        pedido = Pedido.objects.select_for_update().get(pk=pedido.pk)
        pedido.estado = nuevo_estado
        pedido.save(update_fields=["estado", "updated_at"])
        if nuevo_estado == Pedido.Estado.ENVIADO:
            from apps.envios.models import Envio

            Envio.objects.get_or_create(
                pedido=pedido,
                defaults={
                    "transportadora": "Por asignar",
                    "estado": "pendiente",
                    "costo_envio": pedido.costo_envio,
                },
            )
    return pedido
