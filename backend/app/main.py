"""eDraft-Backend (FastAPI).

Im MVP hat das Backend genau eine fachliche Aufgabe: den (gemockten)
Konverter-Endpunkt (§8). Daneben existieren eine Health-Route für den
Betrieb sowie die vorbereiteten Nähte für Auth (``app.auth``) und
Persistenz (``app.repository``) — siehe §9.

Sicherheitshinweis (NFA-1): Es gibt KEINE Authentifizierung. Die Anwendung
darf ausschließlich im internen Netz / hinter VPN betrieben werden.
"""

from fastapi import FastAPI

from .routes.convert import router as convert_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="eDraft API",
        description="Backend des FDX-Drehbuch-Editors der Filmakademie BW (MVP/Demo).",
        version="0.1.0",
    )

    app.include_router(convert_router)

    @app.get("/healthz", tags=["ops"])
    async def healthz() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
