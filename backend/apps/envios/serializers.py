from rest_framework import serializers

from .models import Envio


class EnvioSerializer(serializers.ModelSerializer):
    pedido_id = serializers.IntegerField(source="pedido.id", read_only=True)
    pedido_estado = serializers.CharField(source="pedido.estado", read_only=True)
    cliente = serializers.CharField(source="pedido.usuario.email", read_only=True)

    class Meta:
        model = Envio
        fields = [
            "id", "pedido_id", "pedido_estado", "cliente", "transportadora",
            "numero_guia", "estado", "costo_envio", "fecha_despacho",
            "fecha_estimada", "fecha_entrega", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EnvioCambioEstadoSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=Envio.Estado.choices, required=False)
    transportadora = serializers.CharField(max_length=100, required=False)
    numero_guia = serializers.CharField(max_length=80, required=False, allow_blank=True)
    fecha_estimada = serializers.DateField(required=False, allow_null=True)


class EnvioCreateSerializer(serializers.ModelSerializer):
    pedido_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Envio
        fields = [
            "pedido_id", "transportadora", "numero_guia", "estado",
            "costo_envio", "fecha_estimada",
        ]
