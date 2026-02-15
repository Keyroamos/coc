from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from .models import Member, Child
from .serializers import MemberSerializer, ChildSerializer
from ministries.models import Ministry
from django.utils import timezone
from datetime import timedelta

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['full_name', 'phone', 'member_id', 'email']
    filterset_fields = ['gender', 'marital_status', 'saved', 'baptized']

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated]

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_members = Member.objects.count()
        new_members = Member.objects.filter(member_type='NEW').count()
        baptized_members = Member.objects.filter(baptized=True).count()
        active_ministries = Ministry.objects.count()
        
        # Recent activity (members only)
        recent_members = Member.objects.all().order_by('-created_at')[:5]
        
        activities = []
        for m in recent_members:
            activities.append({
                'id': f'm-{m.id}',
                'type': 'registration',
                'title': f'New Member: {m.full_name}',
                'timestamp': m.created_at,
                'description': f'Registered as {m.get_member_type_display()}'
            })
            
        # Sort activities by timestamp desc
        activities.sort(key=lambda x: x['timestamp'], reverse=True)

        # Growth data (last 6 months)
        growth_data = []
        for i in range(5, -1, -1):
            date = timezone.now() - timedelta(days=i*30)
            month_name = date.strftime('%b')
            count = Member.objects.filter(
                created_at__year=date.year,
                created_at__month=date.month
            ).count()
            growth_data.append({
                'month': month_name,
                'members': count
            })

        return Response({
            'total_members': total_members,
            'new_members': new_members,
            'baptized_members': baptized_members,
            'active_ministries': active_ministries,
            'activities': activities,
            'growth_data': growth_data
        })

class GlobalSearchView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        # Search members
        members = Member.objects.filter(full_name__icontains=query)[:5]
        member_results = [{
            'id': m.id,
            'type': 'member',
            'title': m.full_name,
            'subtitle': m.member_id,
            'path': f'/members/{m.id}'
        } for m in members]

        # Search ministries
        ministries = Ministry.objects.filter(name__icontains=query)[:3]
        ministry_results = [{
            'id': min.id,
            'type': 'ministry',
            'title': min.name,
            'subtitle': 'Ministry',
            'path': f'/ministries/{min.id}'
        } for min in ministries]

        return Response(member_results + ministry_results)
