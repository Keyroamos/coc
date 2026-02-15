from rest_framework import serializers
from .models import Attendance, Event, Visitor

class EventSerializer(serializers.ModelSerializer):
    attendance_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_attendance_count(self, obj):
        return obj.attendances.filter(status='PRESENT').count()

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = '__all__'
