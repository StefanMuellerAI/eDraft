"""Persistenz-Naht (§9, NFA-7) — im MVP bewusst NICHT implementiert.

Dieses Protokoll definiert die Schnittstelle, gegen die künftige
Speicher-Endpunkte programmiert werden. Die spätere Implementierung
(PostgreSQL, siehe auskommentierter ``db``-Service in docker-compose.yml)
implementiert ``ScreenplayRepository``; Routen erhalten sie per Dependency.

Datenmodell-Skizze (§11):
    Screenplay: id, title, owner_id (aus SSO), fdx_xml, created_at, updated_at
    User:       id, external_idp_subject, display_name, role
    optional SceneVisualization: screenplay_id, scene_ref, url
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


@dataclass(frozen=True)
class ScreenplaySummary:
    id: str
    title: str
    updated_at: datetime


@dataclass(frozen=True)
class StoredScreenplay:
    id: str
    title: str
    owner_id: str
    fdx_xml: str
    created_at: datetime
    updated_at: datetime


class ScreenplayRepository(Protocol):
    async def save(self, *, title: str, fdx_xml: str, owner_id: str, screenplay_id: str | None = None) -> ScreenplaySummary: ...

    async def load(self, screenplay_id: str) -> StoredScreenplay: ...

    async def list(self, owner_id: str) -> list[ScreenplaySummary]: ...

    async def remove(self, screenplay_id: str) -> None: ...


def get_screenplay_repository() -> ScreenplayRepository | None:
    """Dependency-Hook für Routen. MVP: keine Persistenz vorhanden."""
    return None
