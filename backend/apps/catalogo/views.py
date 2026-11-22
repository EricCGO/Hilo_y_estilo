"""Vistas públicas de catálogo y vistas de administración de productos."""
from django.db.models import F, Q
from rest_framework import generics, serializers, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import require_roles
from apps.core.responses import EnvelopeDetailMixin, data_response
from .models import Categoria, Producto
from .serializers import CategoriaSerializer, ProductoSerializer
from .services import ajustar_stock


class CategoriaListView(generics.ListAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Categoria.objects.filter(activa=True)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return data_response(serializer.data)


class ProductoListView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Producto.objects.filter(activo=True).select_related("categoria")
        params = self.request.query_params
        categoria = params.get("categoria")
        if categoria:
            if categoria.isdigit():
                qs = qs.filter(categoria_id=int(categoria))
            else:
                qs = qs.filter(categoria__slug=categoria)
        q = params.get("q")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(sku__icontains=q))
        orden = params.get("orden", "nombre")
        ordenes = {
            "precio_asc": "precio",
            "precio_desc": "-precio",
            "nombre": "nombre",
            "recientes": "-created_at",
        }
        return qs.order_by(ordenes.get(orden, "nombre"))


class ProductoDetailView(generics.RetrieveAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    queryset = Producto.objects.filter(activo=True).select_related("categoria")

    def retrieve(self, request, *args, **kwargs):
        instancia = self.get_object()
        return data_response(self.get_serializer(instancia).data)


class AjusteStockSerializer(serializers.Serializer):
    cantidad = serializers.IntegerField()
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True)


class AdminCategoriaViewSet(EnvelopeDetailMixin, viewsets.ModelViewSet):
    """CRUD de categorías para el panel administrativo."""

    serializer_class = CategoriaSerializer
    permission_classes = [require_roles("admin_general", "operador_inventario")]
    queryset = Categoria.objects.all()


class AdminProductoStockView(APIView):
    """Ajuste de inventario con trazabilidad."""

    permission_classes = [require_roles("admin_general", "operador_inventario")]

    def patch(self, request, pk):
        serializer = AjusteStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        producto = ajustar_stock(
            pk,
            serializer.validated_data["cantidad"],
            serializer.validated_data.get("motivo", ""),
            actor=request.user,
        )
        return Response({"data": ProductoSerializer(producto).data}, status=status.HTTP_200_OK)


class AdminProductoViewSet(EnvelopeDetailMixin, viewsets.ModelViewSet):
    """CRUD administrativo. El borrado es lógico (`activo=False`)."""

    serializer_class = ProductoSerializer
    permission_classes = [require_roles("admin_general", "operador_inventario")]
    queryset = Producto.objects.all().select_related("categoria")

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        q = params.get("q")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(sku__icontains=q))
        if params.get("stock_bajo") == "true":
            qs = qs.filter(stock__lte=F("stock_minimo"))
        return qs

    def perform_destroy(self, instance):
        instance.activo = False
        instance.save(update_fields=["activo", "updated_at"])
