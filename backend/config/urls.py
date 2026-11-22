"""URLs raíz: API versionada, Swagger y Django Admin nativo."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.core.views import health_view

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/v1/health/", health_view, name="health"),
    path("api/v1/auth/", include("apps.usuarios.urls")),
    path("api/v1/", include("apps.usuarios.urls_admin")),
    path("api/v1/", include("apps.catalogo.urls")),
    path("api/v1/", include("apps.pedidos.urls")),
    path("api/v1/", include("apps.envios.urls")),
    path("api/v1/", include("apps.contacto.urls")),
    path("api/v1/admin/", include("apps.admin_panel.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
