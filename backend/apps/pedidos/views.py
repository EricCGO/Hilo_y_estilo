from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import AppError
from apps.core.permissions import IsOwnerOrAdmin, require_roles
from apps.core.responses import data_response
from .models import Pedido
from .serializers import (
    CambioEstadoSerializer,
    PedidoCreateSerializer,
    PedidoSerializer,
)
from .services import cambiar_estado, cancelar_pedido, crear_pedido


class PedidoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PedidoSerializer

    def get_queryset(self):
        qs = Pedido.objects.filter(usuario=self.request.user).prefetch_related("items")
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PedidoCreateSerializer
        return PedidoSerializer

    def create(self, request, *args, **kwargs):
        serializer = PedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedido = crear_pedido(request.user, serializer.validated_data)
        return Response(
            {"data": PedidoSerializer(pedido).data}, status=status.HTTP_201_CREATED
        )


class PedidoDetailView(generics.RetrieveAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return Pedido.objects.all().prefetch_related("items")

    def retrieve(self, request, *args, **kwargs):
        instancia = self.get_object()
        return data_response(self.get_serializer(instancia).data)


class PedidoCancelarView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def post(self, request, pk):
        pedido = Pedido.objects.filter(pk=pk).first()
        if not pedido:
            raise AppError("NO_ENCONTRADO", "Pedido no encontrado.", 404)
        self.check_object_permissions(request, pedido)
        pedido = cancelar_pedido(pedido, actor=request.user)
        return Response({"data": PedidoSerializer(pedido).data})


class AdminPedidoListView(generics.ListAPIView):
    serializer_class = PedidoSerializer
    permission_classes = [require_roles("admin_general", "operador_ventas")]

    def get_queryset(self):
        qs = Pedido.objects.all().select_related("usuario").prefetch_related("items")
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        return qs


class AdminPedidoEstadoView(APIView):
    permission_classes = [require_roles("admin_general", "operador_ventas")]

    def patch(self, request, pk):
        serializer = CambioEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedido = Pedido.objects.filter(pk=pk).first()
        if not pedido:
            raise AppError("NO_ENCONTRADO", "Pedido no encontrado.", 404)
        pedido = cambiar_estado(pedido, serializer.validated_data["estado"])
        return Response({"data": PedidoSerializer(pedido).data})
