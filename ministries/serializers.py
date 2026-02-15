from rest_framework import serializers
from .models import Ministry

class MinistrySerializer(serializers.ModelSerializer):
    leader_name = serializers.ReadOnlyField(source='leader.username')
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Ministry
        fields = '__all__'

    def get_member_count(self, obj):
        # Assuming Member model has a ministry field or many-to-many
        # If not yet implemented, return 0
        try:
            return obj.members.count()
        except:
            return 0
