/**
 * Zentrale deutsche UI-Texte (NFA-5). Für eine spätere englische Version
 * wird eine `en.ts` mit gleicher Struktur ergänzt und in `index.ts`
 * umgeschaltet — die Komponenten bleiben unverändert.
 */

export const de = {
  app: {
    title: 'eDraft',
    subtitle: 'FDX-Drehbuch-Editor',
    untitled: 'Unbenanntes Drehbuch',
  },
  file: {
    new: 'Neu',
    open: 'FDX öffnen…',
    export: 'FDX exportieren',
    import: 'Dokument importieren…',
    newConfirm:
      'Das aktuelle Drehbuch hat ungespeicherte Änderungen. Trotzdem ein neues Drehbuch beginnen?',
    openError: 'Die Datei konnte nicht gelesen werden:',
    unsavedWarning:
      'Es gibt ungespeicherte Änderungen. Beim Verlassen der Seite gehen sie verloren.',
  },
  elements: {
    'Scene Heading': 'Szenenüberschrift',
    Action: 'Handlung',
    Character: 'Figur',
    Dialogue: 'Dialog',
    Parenthetical: 'Regieanweisung',
    Transition: 'Übergang',
    Shot: 'Einstellung',
    General: 'Allgemein',
  },
  toolbar: {
    elementType: 'Element-Typ',
    bold: 'Fett (Cmd/Strg+B)',
    italic: 'Kursiv (Cmd/Strg+I)',
    underline: 'Unterstrichen (Cmd/Strg+U)',
    textColor: 'Textfarbe',
    moveUp: 'Element nach oben (Alt+Pfeil hoch)',
    moveDown: 'Element nach unten (Alt+Pfeil runter)',
    deleteElement: 'Element löschen',
    shortcutHint: 'Tab: Typ wechseln · Enter: nächstes Element · Cmd/Strg+1–8: Typ setzen',
  },
  color: {
    palette: 'Farbpalette',
    custom: 'Eigene Farbe (Hex)',
    apply: 'Anwenden',
    reset: 'Farbe entfernen',
    invalid: 'Ungültiger Hex-Wert (erwartet: #RRGGBB)',
  },
  outline: {
    title: 'Szenen',
    empty: 'Noch keine Szenenüberschrift vorhanden.',
    hasViz: 'Visualisierung verknüpft',
  },
  inspector: {
    title: 'Eigenschaften',
    noteLabel: 'Notiz zum Element',
    notePlaceholder: 'Gedanken, Anmerkungen, To-dos zu diesem Element…',
    vizLabel: 'Visualisierungs-Link (Bild-URL)',
    vizPlaceholder: 'https://…/szene.png',
    vizOpen: 'Visualisierung öffnen',
    vizOnlyScene: 'Visualisierungs-Links werden an der Szenenüberschrift hinterlegt.',
    empty: 'Cursor in ein Element setzen, um Eigenschaften zu bearbeiten.',
  },
  importDialog: {
    title: 'Dokument importieren (Word/PDF → FDX)',
    description:
      'Die Datei wird an den Konvertierungs-Dienst übertragen und als Drehbuch in den Editor geladen.',
    chooseFile: 'Datei auswählen (.docx, .pdf)',
    submit: 'Konvertieren',
    cancel: 'Abbrechen',
    converting: 'Konvertiere…',
    demoNotice: 'Demo-Modus: Die KI-Konvertierung der Filmakademie folgt.',
    loadPlaceholder: 'Beispiel-Drehbuch trotzdem laden',
    success: 'Das Dokument wurde konvertiert und in den Editor geladen.',
    replaceWarning:
      'Das aktuelle Drehbuch hat ungespeicherte Änderungen und wird beim Laden ersetzt. Fortfahren?',
    genericError: 'Die Konvertierung ist fehlgeschlagen.',
    networkError: 'Der Konvertierungs-Dienst ist nicht erreichbar.',
  },
  status: {
    unsaved: 'Ungespeicherte Änderungen',
    saved: 'Alle Änderungen exportiert',
    scenes: 'Szenen',
    elements: 'Elemente',
  },
} as const

export type Messages = typeof de
