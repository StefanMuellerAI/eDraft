# Anforderungsdokument — FDX-Editor (Web)

**Projekt:** FDX-Drehbuch-Editor für die Filmakademie Baden-Württemberg
**Auftraggeber:** Filmakademie BW (über StefanAI – Research & Development)
**Dokumentstatus:** Pflichtenheft für die Entwickler-Übergabe (MVP / Demo)
**Version:** 1.0
**Zielleser:** Webentwickler

---

## 1. Zielsetzung & Kontext

Es soll ein **webbasierter Editor für Drehbücher im FDX-Format** (Final Draft XML) entstehen. Studierende und Lehrende der Filmakademie sollen damit Drehbücher direkt im Browser schreiben, bestehende FDX-Dateien hochladen und weiterbearbeiten sowie ihre Arbeit als FDX-Datei herunterladen können.

Das Tool wird in der **ersten Ausbaustufe als interne Demo** bereitgestellt — ohne Anmeldung, ohne Datenbank, ohne dauerhafte Speicherung. Es wird unternehmens- bzw. hochschulintern als Webseite aufgerufen.

Wichtige Architektur-Prämisse: Die Anwendung muss so strukturiert sein, dass **Authentifizierung (SSO) und Persistenz (Datenbank) später ohne Architektur-Bruch nachgerüstet** werden können. Diese Funktionen sind für die Demo bewusst nicht implementiert, ihre Anbindungspunkte werden aber vorbereitet.

---

## 2. Geltungsbereich & Abgrenzung

### 2.1 Im Lieferumfang (MVP)

- FDX-Editor im Browser (Lesen, Schreiben, Bearbeiten von Drehbüchern)
- Upload und Parsen bestehender `.fdx`-Dateien
- Erstellen neuer Drehbücher „from scratch"
- Download/Export als valide `.fdx`-Datei
- Textstile inkl. **Farbvergabe** gemäß FDX-Spezifikation
- **Notiz-/Gedankenfunktion** je Element (freier Text)
- **Pro Szene: Hinterlegen eines Links zu einer Visualisierung** (nur ein Link/URL zu einem Bild)
- Sichtbare Funktion „Dokument importieren (Word/PDF → FDX)" — angebunden an einen **API-Endpunkt**, der zunächst **gemockt** ist
- Bereitstellung über **Docker**

### 2.2 Bewusst NICHT im MVP (aber vorzubereiten)

- Keine Benutzer-Authentifizierung → **Architektur muss SSO (z. B. SAML/Shibboleth/DFN-AAI oder OIDC) nachrüstbar machen**
- Keine Datenbank / keine serverseitige Speicherung → **Architektur muss Persistenz nachrüstbar machen**
- Keine echte KI-Konvertierung Word/PDF → FDX → **nur Mock-Endpunkt; echte Anbindung an die KI der Filmakademie erfolgt später**
- Keine Bild-Hosting-Funktion → Bilder werden in der Demo woanders abgelegt; gespeichert wird **nur der Link**

---

## 3. Nutzerrollen (MVP)

In der Demo existiert faktisch **eine anonyme Rolle**: jeder, der die interne Webseite aufruft. Es gibt keine Unterscheidung von Nutzern. Die spätere Rollenlogik (z. B. „Studierende:r", „Lehrende:r", „Admin") wird hier nur als Roadmap-Hinweis vermerkt und in der Datenmodell-Skizze (Abschnitt 11) berücksichtigt.

---

## 4. Funktionale Anforderungen

> Notation: **FA-x** = funktionale Anforderung. Priorität: **MUSS** (MVP-kritisch), **SOLL** (wichtig), **KANN** (optional/Roadmap).

### 4.1 Editor-Kern

- **FA-1 (MUSS):** Der Editor stellt ein Drehbuch als Abfolge typisierter Elemente dar. Unterstützte Element-Typen (entsprechen den FDX-`Paragraph`-Typen, siehe Abschnitt 6):
  *Scene Heading, Action, Character, Dialogue, Parenthetical, Transition, Shot, General.*
- **FA-2 (MUSS):** Der Nutzer kann jedem Absatz einen dieser Typen zuweisen und den Typ wechseln (z. B. per Dropdown, Tastenkürzel und/oder kontextuellem Auto-Verhalten — z. B. wechselt nach „Character" automatisch zu „Dialogue").
- **FA-3 (MUSS):** Drehbuchgerechte Darstellung: Monospace-Schrift (Courier/Courier Prime), elementspezifische Einrückung und Ausrichtung (z. B. Character zentriert/eingerückt, Transition rechtsbündig). Die visuelle Formatierung folgt den Branchenkonventionen.
- **FA-4 (MUSS):** Hinzufügen, Löschen, Verschieben (Reihenfolge) von Absätzen.
- **FA-5 (SOLL):** Szenen-Navigation / Outline-Ansicht (Liste aller Scene Headings als Sprungmarken).

### 4.2 Textstile & Farben

- **FA-6 (MUSS):** Zeichenformatierung **Fett, Kursiv, Unterstrichen** auf Textebene (innerhalb eines Absatzes, auch nur auf Teilstücke anwendbar).
- **FA-7 (MUSS):** **Farbvergabe** für Text. Der Nutzer wählt eine Farbe (Farbpalette + freie Hex-Eingabe). Die Farbe wird beim Export FDX-konform als **48-Bit-Hex** geschrieben (siehe Abschnitt 6.4). Beim Import wird umgekehrt aus dem 48-Bit-Wert die Anzeige-Farbe rekonstruiert.
- **FA-8 (KANN):** Hintergrund-/Highlight-Farbe (FDX `Background`-Attribut). Optional, wenn ohne Mehraufwand abbildbar.

### 4.3 Datei-Handling (FDX)

- **FA-9 (MUSS):** Upload einer bestehenden `.fdx`-Datei. Die Datei wird **clientseitig im Browser** geparst (XML) und in das interne Editor-Modell überführt. *Begründung: Das Lesen/Schreiben von FDX ist reine XML-Verarbeitung und benötigt kein Backend.*
- **FA-10 (MUSS):** Erstellen eines neuen, leeren Drehbuchs.
- **FA-11 (MUSS):** Export/Download des aktuellen Drehbuchs als valide `.fdx`-Datei (clientseitig erzeugt, Browser-Download).
- **FA-12 (SOLL):** Robustheit beim Import: unbekannte/zusätzliche FDX-Elemente dürfen nicht zum Absturz führen (tolerantes Parsen; Unbekanntes wird ignoriert oder unverändert durchgereicht).
- **FA-13 (SOLL):** Warnung bei ungespeicherten Änderungen vor Verlassen/Neuladen der Seite (da keine Persistenz existiert).

### 4.4 Notizen / Gedanken

- **FA-14 (MUSS):** Pro Element (mindestens pro Szene) kann der Nutzer eine **freie Notiz** hinterlegen („alle Gedanken einfließen lassen"). Diese Notizen werden beim Export FDX-konform serialisiert (Empfehlung: FDX `ScriptNote`, siehe Abschnitt 6.5) und beim Import wieder eingelesen.

### 4.5 Visualisierungs-Link pro Szene **(hohe Priorität)**

- **FA-15 (MUSS):** Pro **Szene** (Scene Heading) kann der Nutzer einen **Link zu einer Visualisierung** (Bild-URL) hinterlegen. Es ist ausschließlich ein **Link**; das Bild selbst wird in der Demo **nicht** in der Anwendung gehostet, sondern liegt woanders.
- **FA-16 (SOLL):** Der hinterlegte Link wird im Editor sichtbar dargestellt (z. B. Icon/Vorschau-Link an der Szene) und ist anklickbar (öffnet in neuem Tab).
- **FA-17 (MUSS):** Der Link wird beim Export in die FDX-Datei geschrieben und beim Import wieder ausgelesen (Serialisierungs-Strategie siehe Abschnitt 6.6).

### 4.6 Import bestehender Dokumente (Word/PDF → FDX) — gemockt

- **FA-18 (MUSS):** Es existiert eine **sichtbare** Funktion „Dokument importieren", über die der Nutzer eine bestehende Datei (`.docx`, `.pdf`, ggf. weitere) hochladen kann.
- **FA-19 (MUSS):** Die Konvertierung erfolgt **ausschließlich über einen Backend-API-Endpunkt** (nicht clientseitig), weil die spätere echte Umwandlung die **KI der Filmakademie** aufruft. Siehe API-Vertrag in Abschnitt 8.
- **FA-20 (MUSS):** In der Demo ist dieser Endpunkt **gemockt**: Er nimmt die Datei entgegen und liefert eine valide Beispiel-FDX (oder eine klar definierte „noch nicht verfügbar"-Antwort) zurück. Das Frontend behandelt beide Fälle sauberer (UI zeigt deutlich „Demo-Modus / KI-Konvertierung folgt").
- **FA-21 (SOLL):** Der API-Vertrag ist so definiert, dass die echte KI-Implementierung den Mock **ohne Frontend-Änderung** ersetzen kann.

---

## 5. Nicht-funktionale Anforderungen

- **NFA-1 (Sicherheit/Deployment):** Da **keine Authentifizierung** existiert, **darf die Anwendung nicht öffentlich erreichbar** sein. Betrieb ausschließlich im internen Netz / hinter VPN der Filmakademie. Dies ist eine zwingende Deployment-Auflage und im README zu dokumentieren.
- **NFA-2 (Datenschutz):** Drehbücher sind kreatives Eigentum der Studierenden. In der Demo werden keine Inhalte serverseitig gespeichert. Beim (gemockten) Konverter-Upload ist zu dokumentieren, dass die Datei das Backend erreicht; bei der späteren echten KI-Anbindung ist die Datenweitergabe an die KI gesondert zu bewerten (DSGVO).
- **NFA-3 (Wartbarkeit):** Sauberer, typisierter, dokumentierter Code. Klare Trennung von FDX-Parsing/-Serialisierung (eigenständiges, testbares Modul), Editor-UI und API-Client.
- **NFA-4 (Testbarkeit):** Das FDX-Lese-/Schreibmodul wird mit **Unit-Tests** abgedeckt, inkl. **Round-Trip-Tests** (FDX → internes Modell → FDX bleibt semantisch gleich). Echte FDX-Beispieldateien aus Final Draft als Testfixtures verwenden.
- **NFA-5 (Sprache/i18n):** UI primär **Deutsch**. Texte zentral ablegen (i18n-fähig), damit Englisch später ergänzt werden kann.
- **NFA-6 (Browser):** Aktuelle Versionen von Chrome, Firefox, Edge, Safari (Desktop-first; ein Schreibwerkzeug wird primär am Rechner genutzt).
- **NFA-7 (Erweiterbarkeit):** Architektur-Bruchstellen für **DB** und **Auth/SSO** sind als Schnittstellen/Abstraktionen vorzubereiten (siehe Abschnitte 9 & 11), ohne sie zu implementieren.

---

## 6. FDX-Format — technische Referenz für die Umsetzung

FDX ist ein **textbasiertes XML-Format** (Final Draft ab Version 8). Es kann mit Standard-XML-Werkzeugen gelesen und geschrieben werden — proprietäre Software ist nicht erforderlich. Der Editor muss die folgenden Strukturen abbilden.

### 6.1 Grundgerüst

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ATELIER – TAG</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Maria steht am Fenster, das Licht fällt hart herein.</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>MARIA</Text>
    </Paragraph>
    <Paragraph Type="Parenthetical">
      <Text>(leise)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Wir hätten früher gehen sollen.</Text>
    </Paragraph>
    <Paragraph Type="Transition">
      <Text>SCHNITT AUF:</Text>
    </Paragraph>
  </Content>
</FinalDraft>
```

Hinweis: Das `Version`-Attribut der `<FinalDraft>`-Wurzel sollte einem realen Final-Draft-Zielwert entsprechen (gegen echte Samples prüfen), um maximale Kompatibilität beim Reimport in Final Draft zu sichern.

### 6.2 Struktur-Hierarchie

- **`<FinalDraft>`** — Wurzelelement. Attribute u. a. `DocumentType="Script"`, `Template="No"`, `Version`.
- **`<Content>`** — enthält die eigentlichen Drehbuchinhalte als Folge von `<Paragraph>`.
- **`<Paragraph Type="...">`** — ein Drehbuchelement. Der **`Type`** bestimmt die Art (Scene Heading, Action, …). Optional Layout-Attribute wie `Alignment`, `LeftIndent`, `RightIndent`, `SpaceBefore`, `Spacing`, `StartsNewPage` (für die Demo nicht zwingend zu setzen; Final Draft ergänzt Defaults selbst).
- **`<Text>`** — der eigentliche Textinhalt eines Absatzes. Ein Absatz kann **mehrere `<Text>`-Knoten** enthalten, um Teilstücke unterschiedlich zu formatieren (Fett, Kursiv, Farbe).

### 6.3 Zu unterstützende Paragraph-Typen (MVP)

`Scene Heading`, `Action`, `Character`, `Dialogue`, `Parenthetical`, `Transition`, `Shot`, `General`.

### 6.4 Farben & Stile auf `<Text>`-Ebene — **wichtig**

Relevante Attribute am `<Text>`-Element:

- **`Style`** — Zeichenstil, z. B. `Bold`, `Italic`, `Underline`. Mehrere Stile werden kombiniert (Trennzeichen gegen echte FDX-Samples verifizieren, üblich ist `+`, z. B. `Bold+Italic`).
- **`Color`** — Schriftfarbe als **48-Bit-Hex** im Format `#RRRRGGGGBBBB` (16 Bit pro Kanal), z. B. Schwarz = `#000000000000`.
- **`Background`** — Hintergrundfarbe, gleiches 48-Bit-Format (optional, FA-8).
- Weitere übliche Attribute: `Font` (z. B. „Courier Final Draft"), `Size` (z. B. `12`), `RevisionID`, `AdornmentStyle`.

**Farb-Umrechnung (zwingend korrekt umsetzen):** Standard-24-Bit-Hex (`#RRGGBB`) → FDX-48-Bit, indem **jeder Kanalwert verdoppelt** wird (Byte → Wort durch Verdopplung der zwei Hex-Stellen):

```
#E11D48  →  R: E1→E1E1 | G: 1D→1D1D | B: 48→4848  →  #E1E11D1D4848
#FF0000  →  #FFFF00000000
#000000  →  #000000000000
```
Beim Import umgekehrt: je Kanal die oberen 8 Bit (erste zwei Hex-Stellen) als 24-Bit-Anzeigewert verwenden.

### 6.5 Notizen → FDX `ScriptNote` (FA-14)

Freie Notizen sollen als **`<ScriptNote>`** serialisiert werden — das ist der von Final Draft native Mechanismus für Anmerkungen und überlebt den Round-Trip durch echtes Final Draft.
**Hinweis an den Entwickler:** Die exakte ScriptNote-Schemastruktur (Verschachtelung, Zuordnung zum Absatz) ist **gegen echte, aus Final Draft exportierte FDX-Beispieldateien zu verifizieren**, bevor implementiert wird. Falls eine native ScriptNote-Zuordnung pro Szene zu aufwendig ist, gilt ersatzweise die unter 6.6 beschriebene Strategie.

### 6.6 Visualisierungs-Link pro Szene → Serialisierung (FA-15/-17) — **Design-Entscheidung**

FDX hat **kein natives Feld** für „Bild-URL pro Szene". Es gibt zwei tragfähige Wege; bitte mit Stefan final abstimmen:

- **Option A (Empfehlung für die Demo): eigenes, klar benanntes Kind-Element** im Scene-Heading-`<Paragraph>`, z. B.
  ```xml
  <Paragraph Type="Scene Heading">
    <Text>INT. ATELIER – TAG</Text>
    <FA_Visualization url="https://…/szene-01.png"/>
  </Paragraph>
  ```
  Einfach zu schreiben/lesen, da die FDX-Dateien primär durch **diesen** Editor laufen.
  *Trade-off:* Beim Round-Trip durch das echte Final Draft kann ein unbekanntes Element verworfen werden.

- **Option B (maximale Final-Draft-Kompatibilität): Ablage in einem strukturierten `ScriptNote`** mit einem maschinenlesbaren Marker (z. B. Präfix `VIZ::<url>`). Überlebt Final Draft, ist aber „verstecke Konvention".

**Default-Empfehlung:** Option A für die Demo umsetzen, das Serialisierungsverhalten **kapseln** (eine Stelle im FDX-Modul), sodass ein Wechsel auf Option B später trivial ist. In beiden Fällen: Round-Trip-Test (NFA-4) muss den Link erhalten.

### 6.7 Rechtlicher Hinweis (zur Einordnung, kein Handlungsbedarf für den Dev)

Das FDX-Format selbst ist **nicht urheberrechtlich geschützt** (EU-Rechtslage, EuGH C-406/10, SAS v World Programming: Dateiformate sind keine schützbare Ausdrucksform). Eine eigene Implementierung ist zulässig. Zu beachten ist lediglich: **kein** Final-Draft-Code kopieren/dekompilieren, und **„Final Draft" ist eine Marke** — nicht als Produktname/Logo verwenden; rein beschreibende Nennung („FDX-kompatibel") ist in Ordnung.

---

## 7. Technologie-Stack (Empfehlung mit Begründung)

> Vorgabe: „beste Technologien wählen", Docker-Betrieb, keine DB im MVP, aber nachrüstbar.

### 7.1 Frontend

- **React + TypeScript**, Build mit **Vite**.
  *Begründung:* Standard, schnell, gut wartbar; TypeScript bildet die typisierte FDX-Struktur sauber ab.
- **Editor-Engine: TipTap (auf Basis von ProseMirror).**
  *Begründung — zentral:* Ein Drehbuch ist ein **strukturiertes Dokument mit typisierten Absätzen**. ProseMirror/TipTap erlauben ein **eigenes Schema mit Node-Typen** (Scene Heading, Action, Dialogue, …) und **Marks** (Bold/Italic/Underline/**Farbe**) sowie **Attributen pro Node** (z. B. Visualisierungs-Link an der Szene). Das **mappt 1:1 auf das FDX-`Paragraph Type`-Modell** und ist damit die technisch sauberste Grundlage — deutlich robuster als ein generischer Rich-Text-Editor.
- **Styling:** Tailwind CSS für die App-Oberfläche; **separate, präzise CSS-Regeln** für die drehbuchgerechte Typografie (Courier/Courier Prime, elementspezifische Einrückungen). Schriftempfehlung **Courier Prime** (frei lizenziert).
- **State:** leichtgewichtig (Zustand/Context). Kein Redux nötig.

### 7.2 FDX-Modul (Kernstück, framework-unabhängig)

- Eigenständiges **TypeScript-Modul** für Parsen (`fdx → internes Modell`) und Serialisieren (`internes Modell → fdx`), unabhängig von der UI, voll unit-getestet (NFA-4). Browser-natives `DOMParser`/`XMLSerializer` genügt.

### 7.3 Backend

- **Python + FastAPI** (ASGI, via Uvicorn).
  *Begründung:* Das Backend hat im MVP **eine** echte Aufgabe — den **Konverter-Endpunkt** (Word/PDF → FDX), der später die **KI der Filmakademie** aufruft. Das ist Python-Territorium (Dokument-Parsing wie `python-docx`/`pdfplumber`, KI-Orchestrierung) und entspricht Stefans bestehendem Stack. FastAPI liefert zudem **automatische OpenAPI-Dokumentation** (erleichtert die Übergabe) und eine saubere Basis für die spätere **OIDC/SAML-Middleware**.
  *Alternative:* Wenn der Entwickler reiner JS-Mensch ist, ist ein **Node/Fastify-Backend** vertretbar — die Backend-Oberfläche im MVP ist klein und die Schnittstelle ist HTTP, also später austauschbar. **Empfehlung bleibt FastAPI.**
- Im MVP stellt das Backend bereit: den **gemockten Convert-Endpunkt** (Abschnitt 8) und eine **Health-Route**. Es ist die vorbereitete Naht für künftige Auth- und Persistenz-Endpunkte.

### 7.4 Auslieferung / Reverse Proxy

- **Nginx** als statischer Server für das gebaute Frontend **und** Reverse Proxy: Pfad `/api/*` → FastAPI-Backend, alles andere → Frontend. Ein einziger interner Einstiegspunkt → bequemer interner Aufruf als Webseite.

---

## 8. API-Vertrag — Konverter-Endpunkt (gemockt)

Dieser Endpunkt ist die **einzige** Stelle, an der Konvertierung passiert (FA-19). Der Vertrag muss so stabil sein, dass die echte KI den Mock später **ohne Frontend-Änderung** ersetzt.

### 8.1 Endpunkt

```
POST /api/v1/convert
Content-Type: multipart/form-data
```

**Request:** Feld `file` (Binärupload, erlaubte Typen: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; ggf. weitere). Optional Feld `source_format` (`pdf` | `docx` | `auto`).

**Response 200 (Erfolg):**
```json
{
  "status": "ok",
  "fdx_xml": "<?xml version=\"1.0\" ...><FinalDraft ...>...</FinalDraft>",
  "warnings": []
}
```
Das Frontend lädt `fdx_xml` direkt in den Editor (gleicher Pfad wie ein normaler FDX-Upload).

**Response 202 / definierter „noch nicht verfügbar"-Fall (Demo-Modus):**
```json
{
  "status": "not_implemented",
  "message": "Die KI-Konvertierung der Filmakademie ist noch nicht angebunden.",
  "fdx_xml": "<?xml ... Beispiel-/Platzhalter-FDX ...>"
}
```
Das Frontend zeigt einen deutlichen Hinweis („Demo-Modus: KI-Konvertierung folgt") und kann optional die Platzhalter-FDX laden.

**Fehler:** `4xx/5xx` mit `{ "status": "error", "message": "…" }`.

### 8.2 Mock-Verhalten (MVP)

- Datei wird entgegengenommen (Größe validiert), Inhalt **nicht** echt konvertiert.
- Rückgabe: entweder eine **mitgelieferte valide Beispiel-FDX** oder die `not_implemented`-Antwort (per Konfig-Flag umschaltbar).
- Keine Speicherung der hochgeladenen Datei über den Request hinaus.

### 8.3 Spätere echte Implementierung (nur Roadmap-Notiz)

Der Mock-Handler wird durch einen Aufruf an die KI der Filmakademie ersetzt (Dokument-Text extrahieren → KI strukturiert in Drehbuch-Elemente → FDX serialisieren). Vertrag bleibt identisch.

---

## 9. Architektur & Erweiterungs-Nähte

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

**Vorzubereitende Nähte (implementieren: nein / Schnittstelle definieren: ja):**

- **Auth-Naht:** Im Frontend ein **Auth-Context**, der im MVP ein No-Op ist (immer „anonym, erlaubt"). Im Backend eine **Auth-Dependency/Middleware**, die im MVP durchwinkt. Spätere Aktivierung: **OIDC** oder **SAML/Shibboleth** — deutsche Hochschulen nutzen verbreitet die **DFN-AAI (Shibboleth/SAML)**; falls die Filmakademie einen OIDC-Provider hat, ist OIDC der einfachere Weg. Single-Sign-on so, dass Studierende sich künftig mit ihrem Hochschul-Account anmelden.
- **Persistenz-Naht:** Das FDX-Modell wird gegen ein **Repository-Interface** (z. B. `ScreenplayRepository` mit `save/load/list`) gedacht. Im MVP existiert keine Implementierung (bzw. höchstens In-Memory). Spätere Implementierung: **PostgreSQL**. Frontend „Speichern/Öffnen" gegen Storage statt nur Datei-Download/-Upload.

Wichtig: Diese Nähte kosten im MVP wenig Aufwand, verhindern aber später teure Umbauten. Sie sind **nicht** auszuprogrammieren, nur als klare Schnittstellen anzulegen.

---

## 10. Deployment (Docker) — MUSS

- **`docker-compose.yml`** orchestriert die Services:
  - `frontend` — Build des React/Vite-Projekts, Auslieferung über Nginx; Nginx proxyt `/api` an `backend`.
  - `backend` — FastAPI via Uvicorn.
  - *(Platzhalter, auskommentiert/dokumentiert)* `db` — PostgreSQL, für die Zukunft vorbereitet, im MVP nicht aktiv.
- **Mehrstufige Dockerfiles** (Frontend: Build-Stage + schlanke Nginx-Runtime; Backend: schlankes Python-Image).
- **Konfiguration über Umgebungsvariablen** (`.env`), u. a. Mock-Flag des Convert-Endpunkts, erlaubte Upload-Größe/-Typen, künftiges Auth-/DB-Toggle.
- **README** mit: Start (`docker compose up`), interner Aufruf-URL, **ausdrücklicher Sicherheitshinweis NFA-1** (nur internes Netz, keine öffentliche Exposition ohne Auth).
- Ein einziger interner Port/Einstiegspunkt (über Nginx), damit „interne Webseite aufrufen" trivial ist.

---

## 11. Datenmodell-Skizze (für spätere Persistenz, nur Vorbereitung)

Nicht für den MVP zu implementieren — dient der Naht-Vorbereitung:

- **Screenplay:** `id`, `title`, `owner_id` (später aus SSO), `fdx_xml` oder strukturierte Repräsentation, `created_at`, `updated_at`.
- **User:** `id`, `external_idp_subject` (SSO-Subject), `display_name`, `role` (`student` | `lecturer` | `admin`).
- **(optional) SceneVisualization:** falls Bild-Links künftig strukturiert statt nur in der FDX gehalten werden sollen: `screenplay_id`, `scene_ref`, `url`.

---

## 12. Akzeptanzkriterien (MVP-Demo)

1. Eine echte, aus Final Draft exportierte `.fdx` lässt sich hochladen, wird korrekt dargestellt, kann bearbeitet, wieder exportiert und **fehlerfrei in Final Draft geöffnet** werden (Round-Trip).
2. Ein neues Drehbuch kann von Grund auf erstellt und als valide `.fdx` heruntergeladen werden.
3. Alle Element-Typen aus FA-1 sind anlegbar und werden korrekt nach FDX serialisiert.
4. **Textfarben** werden im Editor gesetzt, korrekt als 48-Bit-Hex exportiert und beim Reimport wiederhergestellt.
5. **Notizen** und **pro-Szene-Visualisierungslinks** überstehen den Round-Trip (Export → Import erhält die Werte).
6. Die Funktion „Dokument importieren (Word/PDF)" ist **sichtbar**, ruft den **API-Endpunkt** auf und zeigt das definierte Demo-/Mock-Verhalten.
7. Die gesamte Anwendung startet reproduzierbar mit **`docker compose up`** und ist intern als Webseite erreichbar.

---

## 13. Offene Punkte / Annahmen (mit Stefan zu klären)

- **Exakte ScriptNote-/Viz-Link-Serialisierung** (Abschnitt 6.5/6.6): Option A vs. B final festlegen — abhängig davon, ob die Dateien später auch durch das echte Final Draft laufen sollen.
- **Ziel-FDX-Version** (Wert im `Version`-Attribut) für maximale Final-Draft-Kompatibilität.
- **SSO-Verfahren der Filmakademie** (OIDC vs. SAML/DFN-AAI) — relevant erst für die spätere Auth-Stufe, beeinflusst aber die Naht-Gestaltung leicht.
- **Erlaubte Importformate** über `.docx`/`.pdf` hinaus.
- **Backend-Sprache:** FastAPI (empfohlen) vs. Node — abhängig vom Profil des Webentwicklers.
