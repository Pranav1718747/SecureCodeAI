"""Enterprise Logging Configuration for SecureCode AI.

Configures structlog to emit structured JSON logs suitable for CloudWatch,
Datadog, or Splunk integration.
"""

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "class": "logging.Formatter",
            "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
        },
        "console": {
            "class": "logging.Formatter",
            "format": '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": "securecodeai_backend.log",
            "formatter": "json",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "accounts": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "repositories": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "reviews": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "patches": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "verification": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "training": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "evaluation": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "monitoring": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "ai": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "celery": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
