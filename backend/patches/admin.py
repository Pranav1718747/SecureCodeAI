"""Admin interface for Patches app."""

from django.contrib import admin
from .models import Patch

@admin.register(Patch)
class PatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'vulnerability', 'status', 'suggested_by_agent', 'created_at')
    list_filter = ('status',)
    search_fields = ('vulnerability__title',)
