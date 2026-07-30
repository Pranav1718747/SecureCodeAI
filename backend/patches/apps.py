"""App configuration."""
from django.apps import AppConfig

class PatchesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "patches"

    def ready(self):
        import patches.signals  # noqa
        
        # GitHub Token Validation on Startup
        from config.env import settings
        import logging
        import requests
        
        logger = logging.getLogger('django')
        
        token = settings.github_token
        if not token:
            logger.error("ERROR: GitHub token missing.")
        else:
            logger.info("GitHub token detected.")
            logger.info(f"Length: {len(token)}")
            if len(token) > 4:
                logger.info(f"Prefix: {token[:4]}{'*' * (len(token)-4)}")
                
            try:
                # Synchronous GET request to verify token
                response = requests.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/vnd.github.v3+json"
                    },
                    timeout=5
                )
                if response.status_code == 200:
                    data = response.json()
                    logger.info("GitHub authentication verified.")
                    logger.info(f"Authenticated as: {data.get('login')}")
                else:
                    logger.error(f"GitHub authentication failed. API Response: HTTP {response.status_code} - {response.text}")
            except Exception as e:
                logger.error(f"GitHub authentication request failed: {e}")
