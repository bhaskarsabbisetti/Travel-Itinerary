from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserPreferences

@api_view(['GET', 'PUT'])
def preferences(request):
    if request.method == 'GET':
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        return Response({'preferences': prefs.data})

    # PUT
    data = request.data or {{}}
    prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
    prefs.data = data
    prefs.save()
    return Response({'preferences': prefs.data}, status=status.HTTP_200_OK)
