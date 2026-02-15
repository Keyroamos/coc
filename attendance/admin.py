from django.contrib import admin
from .models import Event, Attendance

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'is_service')
    list_filter = ('is_service', 'date')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('member', 'event', 'status')
    list_filter = ('event', 'status')
    search_fields = ('member__full_name', 'event__name')
