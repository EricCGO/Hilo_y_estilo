"""Helpers para un envelope único: { data: ... } / { data: ..., meta: ... }."""
from rest_framework.response import Response


def data_response(data, status=200):
    return Response({"data": data}, status=status)


class EnvelopeDetailMixin:
    """Envuelve las acciones de detalle de un ModelViewSet.

    Las acciones de lista siguen usando la paginación global, que ya
    devuelve { data, meta }.
    """

    def retrieve(self, request, *args, **kwargs):
        instancia = self.get_object()
        return data_response(self.get_serializer(instancia).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return data_response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        parcial = kwargs.pop("partial", False)
        instancia = self.get_object()
        serializer = self.get_serializer(
            instancia, data=request.data, partial=parcial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return data_response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, partial=True, **kwargs)
