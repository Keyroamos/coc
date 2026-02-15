from rest_framework import serializers
from .models import Member, Child

class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = '__all__'
        read_only_fields = ('member',) 

class MemberSerializer(serializers.ModelSerializer):
    children = ChildSerializer(many=True, required=False)
    main_ministry_name = serializers.ReadOnlyField(source='main_ministry.name')

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('member_id', 'created_at', 'updated_at')

    def create(self, validated_data):
        children_data = validated_data.pop('children', [])
        member = Member.objects.create(**validated_data)
        for child_data in children_data:
            Child.objects.create(member=member, **child_data)
        return member
