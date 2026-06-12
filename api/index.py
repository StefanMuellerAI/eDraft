"""Vercel-Einstiegspunkt: exponiert die FastAPI-App als Serverless Function.

Vercel erwartet eine ASGI-App namens ``app`` unter ``api/``. Alle Requests
auf ``/api/*`` und ``/healthz`` werden per Rewrite (siehe vercel.json) auf
diese Function geleitet; FastAPI sieht weiterhin die Original-Pfade, der
API-Vertrag (§8) bleibt unverändert.
"""

import sys
from pathlib import Path

# Backend-Paket (backend/app) importierbar machen.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402, F401
