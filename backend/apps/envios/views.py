from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwnerOrAdmin, require_roles
from apps.core.responses import data_response
from .models import Envio
from .serializers import EnvioCreateSerializer, EnvioCambioEstadoSerializer, EnvioSerializer
from .services import cambiar_estado, crear_envio


class MisEnviosListView(generics.ListAPIView):
    serializer_class = EnvioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Envio.objects.filter(pedido__usuario=self.request.user).select_related(
            "pedido", "pedido__usuario"
        )


class EnvioDetailView(generics.RetrieveAPIView):
    serializer_class = EnvioSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = Envio.objects.all().select_related("pedido", "pedido__usuario")

    def retrieve(self, request, *args, **kwargs):
        instancia = self.get_object()
        return data_response(self.get_serializer(instancia).data)


class AdminEnvioListView(generics.ListAPIView):
    serializer_class = EnvioSerializer
    permission_classes = [require_roles("admin_general", "operador_logistica")]

    def get_queryset(self):
        qs = Envio.objects.all().select_related("pedido", "pedido__usuario")
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        return qs


class AdminEnvioCreateView(generics.CreateAPIView):
    serializer_class = EnvioCreateSerializer
    permission_classes = [require_roles("admin_general", "operador_logistica")]

    def get_serializer_class(self):
        return EnvioCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = EnvioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedido_id = serializer.validated_data.pop("pedido_id")
        envio = crear_envio(pedido_id, serializer.validated_data)
        return Response({"data": EnvioSerializer(envio).data}, status=201)


class AdminEnvioUpdateView(generics.UpdateAPIView):
    """Solo permite transiciones válidas; usa el service de envíos."""

    serializer_class = EnvioSerializer
    permission_classes = [require_roles("admin_general", "operador_logistica")]
    queryset = Envio.objects.all()

    def patch(self, request, *args, **kwargs):
        serializer = EnvioCambioEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = dict(serializer.validated_data)
        envio_actual = self.get_object()
        estado = datos.pop("estado", envio_actual.estado)
        envio = cambiar_estado(envio_actual, estado, datos)
        return Response({"data": EnvioSerializer(envio).data})
