"""Admin interface for Repositories app."""

from django.contrib import admin
from .models import Repository, ZipUpload


@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'is_private', 'language', 'ast_index_status', 'created_at')
    search_fields = ('name', 'full_name', 'organization__name')
    list_filter = ('is_private', 'language', 'ast_index_status')


@admin.register(ZipUpload)
class ZipUploadAdmin(admin.ModelAdmin):
    list_display = ('repository', 'uploaded_by', 'status', 'created_at')
    list_filter = ('status',)
