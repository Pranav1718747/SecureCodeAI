import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to the repository root where .env is stored
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

print(f"--- Environment Loading Trace ---")
print(f"Current working directory: {os.getcwd()}")
print(f"Absolute path to .env: {ENV_PATH}")
print(f"Exists: {ENV_PATH.exists()}")

# Load explicitly
loaded = load_dotenv(dotenv_path=ENV_PATH, override=True)
print(f"Loaded: {loaded}")
print(f"---------------------------------")

class Settings(BaseSettings):
    github_token: str | None = None
    
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding='utf-8',
        extra='ignore'
    )

# Instantiate globally
settings = Settings()
