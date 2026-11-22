"""Autenticación JWT leída desde cookies httpOnly en lugar del header Authorization."""
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Valida el access_token almacenado en la cookie httpOnly `access_token`."""

    cookie_name = "access_token"

    def authenticate(self, request):
        raw_token = request.COOKIES.get(self.cookie_name)
        if not raw_token:
            return None
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
