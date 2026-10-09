"""App settings, read from environment variables (or a local .env file)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Where the Ollama server is listening. Default = Ollama on this computer.
    ollama_base_url: str = "http://localhost:11434"
    # Any Ollama model tag works, e.g. "gemma3:4b", "gemma3:1b", "gemma4:e2b".
    ollama_model: str = "gemma3:4b"
    # Small models on a laptop CPU/GPU can take a while — be generous.
    ollama_timeout_seconds: float = 180.0
    # Lower = more predictable, less "creative" advice.
    ollama_temperature: float = 0.4
    # Comma-separated list of frontend URLs allowed to call this API.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def model_runs_locally(self) -> bool:
        # Ollama "cloud" tags (e.g. gemma4:cloud) run on Ollama's servers, not your machine.
        is_local_host = any(h in self.ollama_base_url for h in ("localhost", "127.0.0.1", "[::1]"))
        return is_local_host and "cloud" not in self.ollama_model


@lru_cache
def get_settings() -> Settings:
    return Settings()
