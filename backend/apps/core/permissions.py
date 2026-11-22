from rest_framework.permissions import SAFE_METHODS, BasePermission


class HasRole(BasePermission):
    """Permiso base: el usuario debe tener uno de los roles indicados."""

    roles = set()
    message = "No tienes el rol necesario para esta acción."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "rol", None) in self.roles
        )


def require_roles(*roles):
    """Fábrica de permisos por rol, sin acoplar vistas a roles concretos."""
    return type("HasRequiredRole", (HasRole,), {"roles": set(roles)})


IsAdminUserRole = require_roles("admin_general")


class IsOwnerOrAdmin(BasePermission):
    """El objeto pertenece al usuario o es administrador."""

    message = "No tienes permiso sobre este recurso."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "rol", None) == "admin_general":
            return True
        owner = getattr(obj, "usuario", obj)
        return owner == user
