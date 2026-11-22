from rest_framework import serializers

from .models import ItemPedido, Pedido


class ItemCreateSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField(min_value=1)
    cantidad = serializers.IntegerField(min_value=1, max_value=10000)


class PedidoCreateSerializer(serializers.Serializer):
    items = ItemCreateSerializer(many=True)
    direccion_entrega = serializers.CharField(max_length=255)
    ciudad = serializers.CharField(max_length=100, required=False, default="Popayán")
    telefono_contacto = serializers.CharField(max_length=30)
    notas = serializers.CharField(allow_blank=True, required=False, default="")

    def validate_items(self, value):
        ids = [item["producto_id"] for item in value]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("No se puede repetir un producto en el pedido.")
        return value


class ItemPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = [
            "id", "producto", "nombre_producto", "precio_unitario",
            "cantidad", "subtotal",
        ]


class PedidoSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True, read_only=True)
    usuario_email = serializers.CharField(source="usuario.email", read_only=True)

    class Meta:
        model = Pedido
        fields = [
            "id", "usuario_email", "estado", "subtotal", "costo_envio", "total",
            "direccion_entrega", "ciudad", "telefono_contacto", "notas",
            "items", "created_at", "updated_at",
        ]
        read_only_fields = fields


class CambioEstadoSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=Pedido.Estado.choices)
