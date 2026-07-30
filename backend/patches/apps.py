"""App configuration."""
from django.apps import AppConfig

class PatchesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "patches"

    def ready(self):
        import patches.signals  # noqa
