from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.utils.translation import gettext_lazy as _
from .models import APIToken

class BearerTokenAuthentication(BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise exceptions.AuthenticationFailed(_('Invalid Authorization header.'))

        key = parts[1]
        try:
            token = APIToken.objects.select_related('user').get(key=key)
        except APIToken.DoesNotExist:
            raise exceptions.AuthenticationFailed(_('Invalid or expired token.'))

        return (token.user, token)
