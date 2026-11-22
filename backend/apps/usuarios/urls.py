from django.urls import path

from .views import LoginView, LogoutView, MeView, RefreshView, RegistroView

urlpatterns = [
    path("register/", RegistroView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
]
