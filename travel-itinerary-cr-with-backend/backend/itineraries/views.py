from datetime import timedelta, date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Itinerary

def itinerary_to_dict(itinerary):
    return {
        'id': itinerary.id,
        'title': itinerary.title,
        'destination': itinerary.destination,
        'start_date': itinerary.start_date.isoformat() if itinerary.start_date else None,
        'end_date': itinerary.end_date.isoformat() if itinerary.end_date else None,
        'days_count': itinerary.days_count,
        'budget_range': itinerary.budget_range,
        'interests': itinerary.interests,
        'days_plan': itinerary.days_plan,
        'ai_generated': itinerary.ai_generated,
        'created_at': itinerary.created_at.isoformat(),
        'updated_at': itinerary.updated_at.isoformat(),
    }

@api_view(['GET', 'POST'])
def itineraries_list_create(request):
    if request.method == 'GET':
        qs = Itinerary.objects.filter(user=request.user).order_by('-created_at')
        data = [itinerary_to_dict(i) for i in qs]
        return Response({'itineraries': data})

    # POST
    payload = request.data or {}
    title = payload.get('title', '').strip() or 'Untitled Trip'
    destination = payload.get('destination', '').strip()
    days_count = payload.get('days_count') or 1
    budget_range = payload.get('budget_range', '')
    interests = payload.get('interests') or []
    days_plan = payload.get('days_plan') or []
    ai_generated = bool(payload.get('ai_generated'))

    start_date = payload.get('start_date')
    end_date = payload.get('end_date')
    if start_date and not end_date and days_count:
        try:
            d0 = date.fromisoformat(start_date)
            end_date = (d0 + timedelta(days=int(days_count)-1)).isoformat()
        except Exception:
            end_date = None

    itinerary = Itinerary.objects.create(
        user=request.user,
        title=title,
        destination=destination,
        start_date=start_date or None,
        end_date=end_date or None,
        days_count=days_count or 1,
        budget_range=budget_range,
        interests=interests,
        days_plan=days_plan,
        ai_generated=ai_generated,
    )
    return Response({'itinerary': itinerary_to_dict(itinerary)}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def itinerary_detail(request, pk):
    itinerary = get_object_or_404(Itinerary, pk=pk, user=request.user)

    if request.method == 'GET':
        return Response({'itinerary': itinerary_to_dict(itinerary)})

    if request.method == 'DELETE':
        itinerary.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT
    payload = request.data or {}
    for field in ['title', 'destination', 'budget_range']:
        if field in payload:
            setattr(itinerary, field, payload[field])

    if 'start_date' in payload:
        itinerary.start_date = payload['start_date'] or None
    if 'end_date' in payload:
        itinerary.end_date = payload['end_date'] or None
    if 'days_count' in payload:
        itinerary.days_count = payload['days_count'] or 1
    if 'interests' in payload:
        itinerary.interests = payload['interests'] or []
    if 'days_plan' in payload:
        itinerary.days_plan = payload['days_plan'] or []
    if 'ai_generated' in payload:
        itinerary.ai_generated = bool(payload['ai_generated'])

    itinerary.save()
    return Response({'itinerary': itinerary_to_dict(itinerary)})

@api_view(['POST'])
def generate_itinerary(request):
    data = request.data or {}
    destination = data.get('destination', 'Your Destination')
    duration = int(data.get('duration') or 3)
    budget_range = data.get('budget_range', 'moderate')
    interests = data.get('interests') or []

    # Simple built-in generator (no external AI): create basic day plans
    days_plan = []
    for i in range(duration):
        day_num = i + 1
        activities = [{
            'time': '09:00',
            'activity': f'Explore {destination} - Day {day_num}',
            'location': destination,
            'notes': 'Auto-generated activity based on your interests.'
        }]
        days_plan.append({
            'title': f'Day {day_num} in {destination}',
            'description': f'Day {day_num} of your trip in {destination}.',
            'activities': activities,
            'meals': [],
            'tips': [],
        })

    itinerary = {
        'title': f'{duration}-Day Trip to {destination}',
        'destination': destination,
        'days_count': duration,
        'budget_range': budget_range,
        'interests': interests,
        'days_plan': days_plan,
        'ai_generated': True,
    }
    return Response({'itinerary': itinerary})
