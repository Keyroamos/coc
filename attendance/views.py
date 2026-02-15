from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Attendance, Event, Visitor
from .serializers import AttendanceSerializer, EventSerializer, VisitorSerializer
from django.utils import timezone

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def today(self, request):
        now = timezone.now()
        # Find or create a service for today
        event, created = Event.objects.get_or_create(
            date__date=now.date(),
            is_service=True,
            defaults={'name': f"Sunday Service - {now.strftime('%d %b %Y')}", 'date': now}
        )
        serializer = self.get_serializer(event)
        return Response(serializer.data)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['event', 'member']

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        event_id = request.data.get('event')
        member_id = request.data.get('member')
        
        if not event_id or not member_id:
            return Response({'error': 'event and member are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        attendance, created = Attendance.objects.get_or_create(
            event_id=event_id,
            member_id=member_id,
        )
        
        if not created:
            # If it already existed, toggle status or delete if we want "tick/untick"
            # Here let's just toggle between PRESENT and ABSENT
            attendance.status = 'PRESENT' if attendance.status == 'ABSENT' else 'ABSENT'
            attendance.save()
        else:
            attendance.status = 'PRESENT'
            attendance.save()
            
        return Response(AttendanceSerializer(attendance).data)

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['event']
