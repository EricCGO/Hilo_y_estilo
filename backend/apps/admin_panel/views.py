"""Métricas del panel administrativo."""
from django.db.models import F, Count, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalogo.models import Producto
from apps.core.permissions import require_roles
from apps.pedidos.models import Pedido


class DashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        require_roles(
            "admin_general", "operador_inventario", "operador_logistica", "operador_ventas"
        ),
    ]

    def get(self, _request):
        inicio_mes = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        del_mes = Pedido.objects.filter(
            created_at__gte=inicio_mes
        ).exclude(estado=Pedido.Estado.CANCELADO)
        ingresos = del_mes.aggregate(total=Sum("total"))["total"] or 0
        return Response(
            {
                "data": {
                    "ventas_mes": del_mes.count(),
                    "ingresos_mes": str(ingresos),
                    "pedidos_pendientes": Pedido.objects.filter(
                        estado=Pedido.Estado.PENDIENTE
                    ).count(),
                    "stock_bajo": Producto.objects.filter(
                        activo=True, stock__lte=F("stock_minimo")
                    ).count(),
                    "total_productos": Producto.objects.filter(activo=True).count(),
                    "pedidos_por_estado": list(
                        Pedido.objects.values("estado").annotate(total=Count("id"))
                    ),
                }
            }
        )
