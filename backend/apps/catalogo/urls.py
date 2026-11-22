from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoriaViewSet,
    AdminProductoStockView,
    AdminProductoViewSet,
    CategoriaListView,
    ProductoDetailView,
    ProductoListView,
)

router = DefaultRouter()
router.register(r"admin/productos", AdminProductoViewSet, basename="admin-productos")
router.register(r"admin/categorias", AdminCategoriaViewSet, basename="admin-categorias")

urlpatterns = [
    path("categorias/", CategoriaListView.as_view(), name="categoria-list"),
    path("productos/", ProductoListView.as_view(), name="producto-list"),
    path("productos/<slug:slug>/", ProductoDetailView.as_view(), name="producto-detail"),
    path(
        "admin/productos/<int:pk>/stock/",
        AdminProductoStockView.as_view(),
        name="admin-producto-stock",
    ),
    *router.urls,
]
