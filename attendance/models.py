from django.db import models
from core.models import TimeStampedModel
from members.models import Member

class Event(TimeStampedModel):
    name = models.CharField(max_length=255)
    date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    is_service = models.BooleanField(default=True) # e.g. Sunday Service

    def __str__(self):
        return f"{self.name} - {self.date.strftime('%Y-%m-%d')}"

class Attendance(TimeStampedModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendances')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, default='PRESENT') # Present, Absent, Excused

    class Meta:
        unique_together = ('member', 'event')

    def __str__(self):
        return f"{self.member} - {self.event}"

class Visitor(TimeStampedModel):
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    residence = models.CharField(max_length=255, blank=True, null=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='visitors')

    def __str__(self):
        return f"{self.full_name} (Visitor at {self.event.name})"
