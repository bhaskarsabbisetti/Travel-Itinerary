from django.urls import path
from . import views_user

urlpatterns = [
    path('preferences', views_user.preferences, name='preferences'),
]
