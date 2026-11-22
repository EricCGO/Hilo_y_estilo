"""URLs del módulo de usuarios dentro del panel administrativo."""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import UsuarioAdminViewSet, UsuarioEstadoView

router = DefaultRouter()
router.register(r"admin/usuarios", UsuarioAdminViewSet, basename="admin-usuarios")

urlpatterns = [
    path(
        "admin/usuarios/<int:pk>/estado/",
        UsuarioEstadoView.as_view(),
        name="admin-usuario-estado",
    ),
    *router.urls,
]
