"""Registro, login, refresh y logout con JWT en cookies httpOnly."""
from rest_framework import serializers, status, viewsets
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import AppError, build_error
from apps.core.permissions import require_roles
from apps.core.responses import EnvelopeDetailMixin, data_response
from apps.core.throttling import LoginThrottle, RefreshThrottle, RegistroThrottle
from .models import Usuario
from .serializers import (
    LoginSerializer,
    RegistroSerializer,
    UsuarioAdminSerializer,
    UsuarioSerializer,
)
from .services import cambiar_estado
from .tokens import (
    REFRESH_COOKIE,
    blacklist_refresh,
    clear_auth_cookies,
    emitir_tokens,
    rotar_refresh,
    set_auth_cookies,
)


class RegistroView(CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]
    throttle_classes = [RegistroThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        access, refresh = emitir_tokens(usuario)
        response = Response(
            {"data": UsuarioSerializer(usuario).data}, status=status.HTTP_201_CREATED
        )
        return set_auth_cookies(response, access, refresh)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        usuario = serializer.validated_data["usuario"]
        access, refresh = emitir_tokens(usuario)
        # El cuerpo nunca contiene tokens: solo la cookie httpOnly.
        response = Response({"data": UsuarioSerializer(usuario).data})
        return set_auth_cookies(response, access, refresh)


class RefreshView(APIView):
    """Rota el refresh token y vuelve a fijar ambas cookies."""

    permission_classes = [AllowAny]
    throttle_classes = [RefreshThrottle]

    def post(self, request):
        try:
            access, refresh = rotar_refresh(request.COOKIES.get(REFRESH_COOKIE))
        except AppError as exc:
            return build_error(exc.app_code, str(exc.detail), 401)
        response = Response({"data": {"ok": True}})
        return set_auth_cookies(response, access, refresh)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blacklist_refresh(request.COOKIES.get(REFRESH_COOKIE))
        response = Response(status=status.HTTP_204_NO_CONTENT)
        return clear_auth_cookies(response)


class MeView(RetrieveUpdateAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        return data_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        parcial = kwargs.pop("partial", False)
        serializer = self.get_serializer(
            self.get_object(), data=request.data, partial=parcial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return data_response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, partial=True, **kwargs)


class UsuarioAdminViewSet(EnvelopeDetailMixin, viewsets.ModelViewSet):
    """CRUD de empleados: solo admin_general."""

    serializer_class = UsuarioAdminSerializer
    permission_classes = [require_roles("admin_general")]
    queryset = Usuario.objects.exclude(rol=Usuario.Rol.CLIENTE).order_by("id")

    def destroy(self, request, *args, **kwargs):
        """El borrado es lógico: se desactiva la cuenta."""
        instancia = self.get_object()
        if instancia.pk == request.user.pk:
            raise AppError("PROHIBIDO", "No puedes desactivar tu propia cuenta.", 403)
        instancia.is_active = False
        instancia.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class UsuarioEstadoSerializer(serializers.Serializer):
    activo = serializers.BooleanField()


class UsuarioEstadoView(APIView):
    permission_classes = [require_roles("admin_general")]

    def patch(self, request, pk):
        serializer = UsuarioEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        objetivo = Usuario.objects.filter(pk=pk).first()
        if not objetivo:
            raise AppError("NO_ENCONTRADO", "Usuario no encontrado.", 404)
        usuario = cambiar_estado(request.user, objetivo, serializer.validated_data["activo"])
        return data_response(UsuarioAdminSerializer(usuario).data)
