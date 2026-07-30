"""Admin interface for Accounts app."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Organization, User, APIKey


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'domain', 'subscription_plan', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'domain')
    list_filter = ('subscription_plan', 'is_active')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'organization', 'role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'organization')
    ordering = ('-date_joined',)
    
    # Remove username field from fieldsets
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'organization', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'key_prefix', 'organization', 'created_by', 'is_revoked', 'created_at')
    search_fields = ('name', 'key_prefix')
    list_filter = ('is_revoked', 'organization')
    readonly_fields = ('hashed_key', 'key_prefix')
