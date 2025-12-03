from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls_auth')),
    path('api/user/', include('accounts.urls_user')),
    path('api/', include('itineraries.urls')),  # itineraries + AI generator
]
