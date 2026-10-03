from functools import lru_cache
import os

from pathlib import Path
from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict, YamlConfigSettingsSource

CONFIG_DIR = Path(__file__).resolve().parent / "resources"
PROFILE = os.getenv("APP_ENV", "dev")
YAML_FILES = [
    CONFIG_DIR / "application.yaml",
    CONFIG_DIR / f"application-{PROFILE}.yaml",
]

class DataSourceSettings(BaseModel):
    host: str
    drivername: str
    port: int
    username: str | None = None
    password: SecretStr | None = None
    database: str
    pool_size: int = 5
    
class Settings(BaseSettings):
    env: str = "dev"
    cors_origins: list[str] = ["http://localhost:5173"]
    data_source: DataSourceSettings = DataSourceSettings()

    model_config = SettingsConfigDict(
        yaml_file=YAML_FILES,
        env_file= CONFIG_DIR / f"{PROFILE}.env",
        env_prefix="APP_",
        env_nested_delimiter="__",
    )

    @classmethod
    def settings_customise_sources(cls, settings_cls, init_settings, env_settings, dotenv_settings, file_secret_settings):
        return (
            init_settings,
            env_settings,
            dotenv_settings,
            YamlConfigSettingsSource(settings_cls),
            file_secret_settings
        )

@lru_cache
def get_settings() -> Settings:
    return Settings()
