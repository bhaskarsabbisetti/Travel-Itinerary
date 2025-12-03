from django.urls import path
from . import views_auth

urlpatterns = [
    path('register', views_auth.register, name='register'),
    path('login', views_auth.login, name='login'),
    path('logout', views_auth.logout, name='logout'),
    path('me', views_auth.me, name='me'),
]
