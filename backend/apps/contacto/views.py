from rest_framework import generics
from rest_framework.permissions import AllowAny

from apps.core.responses import data_response
from .models import MensajeContacto
from .serializers import MensajeContactoSerializer


class ContactoCreateView(generics.CreateAPIView):
    queryset = MensajeContacto.objects.all()
    serializer_class = MensajeContactoSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return data_response(serializer.data, status=201)
