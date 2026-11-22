from rest_framework import serializers

from .models import Categoria, Producto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "slug", "descripcion", "activa"]


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source="categoria.nombre", read_only=True)
    imagen_url = serializers.SerializerMethodField()
    agotado = serializers.BooleanField(read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id", "nombre", "slug", "descripcion", "sku", "precio",
            "categoria", "categoria_nombre", "stock", "stock_minimo",
            "activo", "imagen", "imagen_url", "atributos", "agotado",
            "stock_bajo", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_imagen_url(self, obj):
        return obj.imagen.url if obj.imagen else None
