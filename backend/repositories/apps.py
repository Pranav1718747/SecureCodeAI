"""App configuration."""
from django.apps import AppConfig

class RepositoriesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "repositories"

    def ready(self):
        import repositories.signals  # noqa
