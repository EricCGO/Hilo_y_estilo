"""Serializers de autenticación con validación estricta y mensajes seguros."""
from django.contrib.auth import authenticate
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers

from .models import Usuario

MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos."
# Campos que el registro público nunca debe aceptar del cliente.
CAMPOS_RESERVADOS = {
    "rol", "is_staff", "is_superuser", "is_active",
    "username", "groups", "user_permissions", "date_joined",
}


class RegistroSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="first_name", max_length=150, required=False)
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = Usuario
        fields = ["id", "nombre", "email", "password", "telefono", "nombre_taller"]
        # Se desactiva el UniqueValidator automático: validate_email() da un
        # mensaje consistente y controlamos también la carrera en create().
        extra_kwargs = {"email": {"required": True, "validators": []}}

    def validate(self, attrs):
        # Rechazar explícitamente cualquier intento de escalado de privilegios.
        reserved = {
            campo: ["Este campo no se puede asignar desde el registro público."]
            for campo in sorted(CAMPOS_RESERVADOS & set(self.initial_data))
        }
        if reserved:
            raise serializers.ValidationError(reserved)

        candidato = Usuario(
            username=attrs.get("email", ""),
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
        )
        try:
            validate_password(attrs["password"], user=candidato)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from None
        return attrs

    def validate_email(self, value):
        correo = BaseUserManager.normalize_email(value.strip())
        if Usuario.objects.filter(email__iexact=correo).exists():
            # Dentro de validate_email, un string se envuelve una sola vez bajo
            # la clave "email" en la respuesta.
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return correo

    def create(self, validated_data):
        datos = validated_data.copy()
        password = datos.pop("password")
        email = datos.pop("email")
        first_name = datos.pop("first_name", "")
        try:
            with transaction.atomic():
                return Usuario.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=first_name,
                    rol=Usuario.Rol.CLIENTE,  # siempre, ignores what the client sent
                    **datos,
                )
        except IntegrityError:
            # Carrera entre validate_email y el INSERT: respuesta limpia y por campo.
            raise serializers.ValidationError(
                {"email": ["Ya existe una cuenta con este correo."]}
            ) from None


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        return BaseUserManager.normalize_email(value.strip())

    def validate(self, attrs):
        usuario = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        # Mensaje idéntico para correo inexistente, contraseña errónea o cuenta
        # desactivada: no se filtra si el correo está registrado.
        if not usuario or not usuario.is_active:
            raise serializers.ValidationError(MENSAJE_CREDENCIALES)
        attrs["usuario"] = usuario
        return attrs


ROLES_EMPLEADO = [
    Usuario.Rol.ADMIN,
    Usuario.Rol.INVENTARIO,
    Usuario.Rol.LOGISTICA,
    Usuario.Rol.VENTAS,
]


class UsuarioAdminSerializer(serializers.ModelSerializer):
    """Gestión de cuentas operativas desde el panel administrativo."""

    nombre = serializers.CharField(source="first_name", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    rol = serializers.ChoiceField(choices=ROLES_EMPLEADO)
    activo = serializers.BooleanField(source="is_active", required=False)
    email = serializers.EmailField()

    class Meta:
        model = Usuario
        fields = [
            "id", "nombre", "email", "rol", "telefono", "direccion",
            "ciudad", "barrio", "nombre_taller", "activo", "password",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_email(self, value):
        correo = BaseUserManager.normalize_email(value.strip())
        qs = Usuario.objects.filter(email__iexact=correo)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return correo

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError(
                {"password": ["La contraseña es obligatoria al crear empleados."]}
            )
        if "password" in attrs:
            candidato = Usuario(
                username=attrs.get("email", self.instance.email if self.instance else ""),
                email=attrs.get("email", ""),
                first_name=attrs.get("first_name", ""),
            )
            try:
                validate_password(attrs["password"], user=candidato)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(
                    {"password": list(exc.messages)}
                ) from None
        return attrs

    def create(self, validated_data):
        datos = validated_data.copy()
        password = datos.pop("password")
        activo = datos.pop("is_active", True)
        email = datos.pop("email")
        rol = datos["rol"]
        return Usuario.objects.create_user(
            username=email,
            email=email,
            password=password,
            is_active=activo,
            is_staff=(rol == Usuario.Rol.ADMIN),
            **datos,
        )

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)
        if instance.rol != Usuario.Rol.ADMIN:
            instance.is_staff = False
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="first_name", required=False)
    rol = serializers.CharField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id", "nombre", "email", "rol", "telefono",
            "direccion", "ciudad", "barrio", "nombre_taller",
        ]
        read_only_fields = ["id", "email", "rol"]
