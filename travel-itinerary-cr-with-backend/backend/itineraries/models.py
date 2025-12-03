from django.conf import settings
from django.db import models

class Itinerary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='itineraries')
    title = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    days_count = models.PositiveIntegerField(default=1)
    budget_range = models.CharField(max_length=50, blank=True)
    interests = models.JSONField(default=list, blank=True)
    days_plan = models.JSONField(default=list, blank=True)
    ai_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.destination}"

    class Meta:
        ordering = ['-created_at']
