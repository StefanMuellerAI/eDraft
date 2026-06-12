"""Auth-Naht (§9, NFA-7).

Im MVP existiert keine Anmeldung: Die Dependency ``get_current_user`` winkt
jeden Aufrufer als anonymen Nutzer durch. Bei der späteren SSO-Anbindung
(OIDC oder SAML/Shibboleth/DFN-AAI) wird ausschließlich diese Datei um die
Token-/Session-Validierung erweitert — alle Routen deklarieren die
Abhängigkeit bereits heute und bleiben unverändert.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    """Minimaler Principal; Felder entsprechen der Datenmodell-Skizze (§11)."""

    id: str
    display_name: str
    role: str  # "student" | "lecturer" | "admin" | "anonymous"
    is_authenticated: bool


ANONYMOUS_USER = User(
    id="anonymous",
    display_name="Anonym",
    role="anonymous",
    is_authenticated=False,
)


async def get_current_user() -> User:
    """MVP: immer anonym, immer erlaubt.

    Später: Token aus dem Request lesen, gegen den IdP validieren und bei
    Fehlern ``HTTPException(401)`` werfen.
    """
    return ANONYMOUS_USER
