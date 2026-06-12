"""Konfiguration über Umgebungsvariablen (§10).

Alle Variablen tragen das Präfix ``EDRAFT_``, z. B.::

    EDRAFT_CONVERT_MODE=sample          # "sample" | "not_implemented"
    EDRAFT_MAX_UPLOAD_MB=20
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="EDRAFT_")

    # Mock-Verhalten des Convert-Endpunkts (§8.2):
    # "sample"          → liefert die mitgelieferte Beispiel-FDX (Status ok)
    # "not_implemented" → liefert die definierte "noch nicht verfügbar"-Antwort
    convert_mode: Literal["sample", "not_implemented"] = "sample"

    # Erlaubte Upload-Größe (NFA: Validierung am Systemrand).
    max_upload_mb: int = 20

    # Vorbereitete Toggles für spätere Ausbaustufen (§9) — im MVP ohne Wirkung.
    auth_enabled: bool = False
    database_url: str | None = None

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
