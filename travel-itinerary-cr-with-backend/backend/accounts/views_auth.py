from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import APIToken, UserPreferences
import secrets

User = get_user_model()

def user_to_dict(user):
    prefs = getattr(user, 'preferences', None)
    return {
        'id': user.id,
        'email': user.email,
        'name': user.username,
        'preferences': prefs.data if prefs else {},
    }

def create_token_for_user(user):
    key = secrets.token_hex(20)
    APIToken.objects.create(user=user, key=key)
    return key

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    email = data.get('email', '').lower().strip()
    password = data.get('password')
    name = data.get('name', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(email=email, username=name or email.split('@')[0], password=password)
    token = create_token_for_user(user)
    return Response({'token': token, 'user': user_to_dict(user)}, status=status.HTTP_201_CREATED)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email = data.get('email', '').lower().strip()
    password = data.get('password')

    user = authenticate(request, email=email, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Create a fresh token
    token = create_token_for_user(user)
    return Response({'token': token, 'user': user_to_dict(user)}, status=status.HTTP_200_OK)

@api_view(['POST'])
def logout(request):
    token_obj = getattr(request.auth, 'key', None)
    if token_obj:
        # request.auth is APIToken instance
        request.auth.delete()
    return Response({'success': True})

@api_view(['GET'])
def me(request):
    return Response({'user': user_to_dict(request.user)})
