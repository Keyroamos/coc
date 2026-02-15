from django.contrib import admin
from .models import Ministry

@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
    list_display = ('name', 'leader', 'updated_at')
    search_fields = ('name', 'leader__username')
