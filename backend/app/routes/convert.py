"""Konverter-Endpunkt ``POST /api/v1/convert`` (§8) — im MVP gemockt (FA-20).

Der API-Vertrag ist stabil: Die spätere echte Implementierung (Dokument-Text
extrahieren → KI der Filmakademie strukturiert in Drehbuch-Elemente → FDX
serialisieren) ersetzt ausschließlich den Rumpf dieses Handlers; das Frontend
bleibt unverändert (FA-21).

Datenschutz (NFA-2): Die hochgeladene Datei erreicht das Backend, wird aber
ausschließlich im Speicher des Requests gehalten und nicht persistiert.
"""

from pathlib import Path
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse

from ..auth import User, get_current_user
from ..config import Settings, get_settings

router = APIRouter(prefix="/api/v1", tags=["convert"])

SAMPLE_FDX_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "sample.fdx"

ALLOWED_EXTENSIONS = {".docx", ".pdf"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

NOT_IMPLEMENTED_MESSAGE = (
    "Die KI-Konvertierung der Filmakademie ist noch nicht angebunden."
)


def _error(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"status": "error", "message": message})


def _is_allowed(file: UploadFile) -> bool:
    extension = Path(file.filename or "").suffix.lower()
    if extension in ALLOWED_EXTENSIONS:
        return True
    return (file.content_type or "") in ALLOWED_CONTENT_TYPES


@router.post("/convert")
async def convert_document(
    file: Annotated[UploadFile, File()],
    settings: Annotated[Settings, Depends(get_settings)],
    _user: Annotated[User, Depends(get_current_user)],
    source_format: Annotated[Literal["pdf", "docx", "auto"], Form()] = "auto",
) -> JSONResponse:
    if not file.filename:
        return _error(400, "Es wurde keine Datei übermittelt.")

    if not _is_allowed(file):
        return _error(
            415,
            "Dieses Dateiformat wird nicht unterstützt (erlaubt: .docx, .pdf).",
        )

    # Größe validieren, ohne mehr als das Limit in den Speicher zu lesen.
    payload = await file.read(settings.max_upload_bytes + 1)
    if len(payload) > settings.max_upload_bytes:
        return _error(
            413,
            f"Die Datei ist zu groß (erlaubt: {settings.max_upload_mb} MB).",
        )

    # MVP-Mock (FA-20): Inhalt wird NICHT konvertiert und NICHT gespeichert.
    sample_fdx = SAMPLE_FDX_PATH.read_text(encoding="utf-8")

    if settings.convert_mode == "not_implemented":
        return JSONResponse(
            status_code=202,
            content={
                "status": "not_implemented",
                "message": NOT_IMPLEMENTED_MESSAGE,
                "fdx_xml": sample_fdx,
            },
        )

    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "fdx_xml": sample_fdx,
            "warnings": [
                "Demo-Modus: Es wurde eine Beispiel-FDX geliefert, keine echte "
                f"Konvertierung von '{file.filename}' (source_format={source_format})."
            ],
        },
    )
