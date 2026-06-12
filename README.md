# eDraft — FDX-Drehbuch-Editor (MVP/Demo)

Webbasierter Editor für Drehbücher im FDX-Format (Final Draft XML) für die
Filmakademie Baden-Württemberg. Drehbücher werden direkt im Browser
geschrieben, bestehende `.fdx`-Dateien hochgeladen und weiterbearbeitet und
als valide `.fdx`-Datei wieder heruntergeladen.

> ## Sicherheitshinweis (zwingend, NFA-1)
>
> Diese Demo hat **keine Authentifizierung** und **keine serverseitige
> Speicherung**. Die Anwendung darf **nicht öffentlich erreichbar** sein.
> Betrieb ausschließlich im internen Netz bzw. hinter dem VPN der
> Filmakademie.

## Start (Docker)

```bash
cp .env.example .env   # optional anpassen
docker compose up --build
```

Aufruf danach intern unter: **http://localhost:8080** (Port über
`EDRAFT_PORT` in `.env` änderbar). Nginx liefert das Frontend aus und proxyt
`/api/*` an das FastAPI-Backend — ein einziger Einstiegspunkt.

## Funktionsumfang (MVP)

- Editor mit den 8 FDX-Element-Typen (Scene Heading, Action, Character,
  Dialogue, Parenthetical, Transition, Shot, General) in drehbuchgerechter
  Darstellung (Courier Prime, branchenübliche Einrückungen)
- Schnelles Schreiben: Enter folgt dem Branchen-Flow (z. B. Character →
  Dialogue), Tab/Shift+Tab wechselt den Element-Typ, Cmd/Strg+1–8 setzt ihn
  direkt, Alt+Pfeile verschieben Elemente
- Fett/Kursiv/Unterstrichen sowie Textfarbe (Palette + freie Hex-Eingabe);
  Export FDX-konform als 48-Bit-Hex, Import rekonstruiert die Anzeige-Farbe
- Freie Notiz pro Element (FDX `ScriptNote`, übersteht den Round-Trip)
- Visualisierungs-Link pro Szene (Bild-URL, anklickbar; Serialisierung als
  `FA_Visualization`-Element, siehe unten)
- FDX-Upload (clientseitiges Parsen), neues Drehbuch, FDX-Download
- Toleranter Import: unbekannte FDX-Elemente/Attribute werden konserviert
  und beim Export unverändert zurückgeschrieben
- Warnung bei ungespeicherten Änderungen vor dem Verlassen der Seite
- „Dokument importieren (Word/PDF → FDX)" über `POST /api/v1/convert` —
  in der Demo **gemockt** (Verhalten per `EDRAFT_CONVERT_MODE` umschaltbar)

## Architektur

```
[ Browser / React + TipTap ]
        |  (statisch)        \  (POST /api/v1/convert)
        v                     v
[ Nginx Reverse Proxy ] --> [ FastAPI Backend ]
        |                         |
   serviert Frontend         /api/v1/convert (MOCK)
                             /healthz
                             [ Naht: Auth-Middleware ]   <- später
                             [ Naht: Persistenz-Layer ]  <- später
```

- `frontend/src/fdx/` — **FDX-Kernmodul** (framework-unabhängig): Modell,
  toleranter Parser, Serializer, 24↔48-Bit-Farbkonvertierung. Vollständig
  unit-getestet inkl. Round-Trip-Tests.
- `frontend/src/editor/` — TipTap-Schema (ein Node-Typ je FDX-Paragraph-Typ,
  Marks für Stile/Farbe) und bidirektionales Mapping zum FDX-Modell.
- `backend/app/` — FastAPI mit dem gemockten Konverter-Endpunkt und
  Health-Route; OpenAPI-Doku unter `/docs`.

### Erweiterungs-Nähte (vorbereitet, nicht implementiert)

- **Auth/SSO:** `frontend/src/auth/AuthContext.tsx` (No-Op-Provider) und
  `backend/app/auth.py` (Durchwink-Dependency). Spätere Aktivierung über
  OIDC oder SAML/Shibboleth (DFN-AAI) ausschließlich in diesen Dateien.
- **Persistenz:** `frontend/src/storage/repository.ts` und
  `backend/app/repository.py` definieren das `ScreenplayRepository`-Interface
  (save/load/list); PostgreSQL-Service liegt auskommentiert in
  `docker-compose.yml`.

### Viz-Link-Serialisierung (Design-Entscheidung, §6.6 Option A)

Der Visualisierungs-Link wird als eigenes Kind-Element im
Scene-Heading-Paragraph gespeichert:

```xml
<Paragraph Type="Scene Heading">
  <Text>INT. ATELIER – TAG</Text>
  <FA_Visualization url="https://…/szene-01.png"/>
</Paragraph>
```

Die Strategie ist in `frontend/src/fdx/vizLink.ts` gekapselt; ein Wechsel auf
Option B (ScriptNote mit `VIZ::`-Marker) ändert nur diese eine Datei.

## API-Vertrag Konverter (stabil, §8)

`POST /api/v1/convert` (multipart, Feld `file`, optional `source_format`).
Antworten: `200 {status:"ok", fdx_xml, warnings}`,
`202 {status:"not_implemented", message, fdx_xml}`,
Fehler `4xx/5xx {status:"error", message}`. Die spätere echte
KI-Konvertierung ersetzt nur den Mock-Handler — das Frontend bleibt
unverändert.

## Entwicklung

Voraussetzungen: Node.js ≥ 22 (siehe `.nvmrc`), Python ≥ 3.11.

```bash
# Frontend (http://localhost:5173, proxyt /api an :8000)
cd frontend
npm install
npm run dev

# Backend (http://localhost:8000, OpenAPI unter /docs)
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/uvicorn app.main:app --reload
```

### Tests

```bash
cd frontend && npm test          # FDX-Modul: Unit- + Round-Trip-Tests (Vitest)
cd backend && .venv/bin/python -m pytest   # Konverter-Endpunkt (Pytest)
```

## Konfiguration (`.env`)

| Variable | Default | Bedeutung |
| --- | --- | --- |
| `EDRAFT_PORT` | `8080` | Interner Einstiegsport (Nginx) |
| `EDRAFT_CONVERT_MODE` | `sample` | Mock-Verhalten: `sample` oder `not_implemented` |
| `EDRAFT_MAX_UPLOAD_MB` | `20` | Upload-Limit des Konverter-Endpunkts |
| `EDRAFT_AUTH_ENABLED` | `false` | Vorbereitet für spätere SSO-Stufe (ohne Wirkung) |

## Datenschutz (NFA-2)

Drehbücher verlassen den Browser nicht — Parsen und Serialisieren der
FDX-Dateien geschieht clientseitig. Einzige Ausnahme: Beim (gemockten)
Dokument-Import erreicht die hochgeladene Datei das Backend; sie wird dort
nicht gespeichert und nach der Antwort verworfen. Vor Anbindung der echten
KI-Konvertierung ist die Datenweitergabe gesondert zu bewerten (DSGVO).

## Hinweis zu Marken

„Final Draft" ist eine Marke der Final Draft, Inc. eDraft ist ein
unabhängiges, FDX-kompatibles Werkzeug und steht in keiner Verbindung zu
Final Draft, Inc.
