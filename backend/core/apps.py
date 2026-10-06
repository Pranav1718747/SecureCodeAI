"""Core application configuration for SecureCode AI."""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
    verbose_name = "SecureCode Core Engine"

    def ready(self):
        import core.signals  # noqa
