from django.urls import path
from . import views

urlpatterns = [
    path('itineraries', views.itineraries_list_create, name='itineraries-list-create'),
    path('itineraries/<int:pk>', views.itinerary_detail, name='itinerary-detail'),
    path('generate-itinerary', views.generate_itinerary, name='generate-itinerary'),
]
