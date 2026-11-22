from rest_framework import serializers

from .models import MensajeContacto


class MensajeContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensajeContacto
        fields = ["id", "nombre", "email", "mensaje", "leido", "created_at"]
        read_only_fields = ["id", "leido", "created_at"]
