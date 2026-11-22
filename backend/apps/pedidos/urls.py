from django.urls import path

from .views import (
    AdminPedidoEstadoView,
    AdminPedidoListView,
    PedidoCancelarView,
    PedidoDetailView,
    PedidoListCreateView,
)

urlpatterns = [
    path("pedidos/", PedidoListCreateView.as_view(), name="pedido-list"),
    path("pedidos/<int:pk>/", PedidoDetailView.as_view(), name="pedido-detail"),
    path(
        "pedidos/<int:pk>/cancelar/",
        PedidoCancelarView.as_view(),
        name="pedido-cancelar",
    ),
    path("admin/pedidos/", AdminPedidoListView.as_view(), name="admin-pedido-list"),
    path(
        "admin/pedidos/<int:pk>/estado/",
        AdminPedidoEstadoView.as_view(),
        name="admin-pedido-estado",
    ),
]
