from django.contrib import admin
from .models import Member, Child

class ChildInline(admin.TabularInline):
    model = Child
    extra = 1

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('member_id', 'full_name', 'phone', 'gender', 'marital_status', 'saved', 'baptized')
    search_fields = ('member_id', 'full_name', 'phone', 'email')
    list_filter = ('gender', 'marital_status', 'saved', 'baptized', 'estate')
    inlines = [ChildInline]
    readonly_fields = ('member_id', 'joined_date')

@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'member', 'date_of_birth')
    search_fields = ('full_name', 'member__full_name')
