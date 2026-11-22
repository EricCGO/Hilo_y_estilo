from django.urls import path

from .views import (
    AdminEnvioCreateView,
    AdminEnvioListView,
    AdminEnvioUpdateView,
    EnvioDetailView,
    MisEnviosListView,
)

urlpatterns = [
    path("envios/", MisEnviosListView.as_view(), name="envio-list"),
    path("envios/<int:pk>/", EnvioDetailView.as_view(), name="envio-detail"),
    path("admin/envios/", AdminEnvioListView.as_view(), name="admin-envio-list"),
    path("admin/envios/crear/", AdminEnvioCreateView.as_view(), name="admin-envio-crear"),
    path("admin/envios/<int:pk>/", AdminEnvioUpdateView.as_view(), name="admin-envio-update"),
]
