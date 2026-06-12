/**
 * Internes, typisiertes Datenmodell für Drehbücher (FDX-kompatibel).
 *
 * Dieses Modul ist framework-unabhängig (keine React-/TipTap-Importe) und
 * bildet die fachliche Wahrheit der Anwendung. Parser und Serializer
 * übersetzen verlustarm zwischen FDX-XML und diesem Modell (NFA-3/NFA-4).
 */

/** Die im MVP unterstützten FDX-Paragraph-Typen (FA-1, §6.3). */
export const PARAGRAPH_TYPES = [
  'Scene Heading',
  'Action',
  'Character',
  'Dialogue',
  'Parenthetical',
  'Transition',
  'Shot',
  'General',
] as const

export type ParagraphType = (typeof PARAGRAPH_TYPES)[number]

export function isParagraphType(value: string): value is ParagraphType {
  return (PARAGRAPH_TYPES as readonly string[]).includes(value)
}

/**
 * Ein zusammenhängend formatiertes Textstück innerhalb eines Absatzes
 * (entspricht einem `<Text>`-Knoten in FDX).
 */
export interface TextRun {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  /** Schriftfarbe als 24-Bit-Hex (`#RRGGBB`), Anzeige-Repräsentation (FA-7). */
  color?: string
  /** Hintergrundfarbe als 24-Bit-Hex (`#RRGGBB`), optional (FA-8). */
  background?: string
  /**
   * Unbekannte/zusätzliche Attribute des `<Text>`-Elements (z. B. `Font`,
   * `Size`, `RevisionID`). Werden beim Export unverändert zurückgeschrieben,
   * damit der Round-Trip durch echtes Final Draft verlustarm bleibt (FA-12).
   */
  passthroughAttributes?: Record<string, string>
}

/** Ein Drehbuch-Element (entspricht einem `<Paragraph>` in FDX). */
export interface ScreenplayElement {
  type: ParagraphType
  /**
   * Ursprünglicher `Type`-Attributwert, falls er nicht zu den unterstützten
   * Typen gehört (z. B. "Cast List"). Der Editor behandelt das Element wie
   * `General`, der Export schreibt aber wieder den Originalwert (FA-12).
   */
  originalType?: string
  runs: TextRun[]
  /** Freie Notiz, serialisiert als FDX `ScriptNote` (FA-14, §6.5). */
  note?: string
  /**
   * Link zu einer Visualisierung (nur sinnvoll bei Scene Heading).
   * Serialisierung gemäß Option A, gekapselt im Serializer (FA-15/17, §6.6).
   */
  visualizationUrl?: string
  /** Unbekannte Paragraph-Attribute (Alignment, LeftIndent, …) — Durchreiche. */
  passthroughAttributes?: Record<string, string>
  /**
   * Unbekannte Kind-Elemente des Paragraphs als serialisierte XML-Fragmente.
   * Werden beim Export unverändert wieder eingefügt (FA-12).
   */
  passthroughChildren?: string[]
}

/** Das gesamte Drehbuch-Dokument. */
export interface Screenplay {
  elements: ScreenplayElement[]
  /** Attribute des `<FinalDraft>`-Wurzelelements (DocumentType, Version, …). */
  rootAttributes: Record<string, string>
  /**
   * Top-Level-Elemente neben `<Content>` (TitlePage, ElementSettings, …) als
   * serialisierte XML-Fragmente, in Originalreihenfolge — Durchreiche (FA-12).
   */
  passthroughDocumentChildren: string[]
}

/** Standard-Attribute für neue Dokumente (§6.1/§6.2). */
export const DEFAULT_ROOT_ATTRIBUTES: Record<string, string> = {
  DocumentType: 'Script',
  Template: 'No',
  Version: '5',
}

/** Erzeugt ein neues, leeres Drehbuch (FA-10). */
export function createEmptyScreenplay(): Screenplay {
  return {
    elements: [{ type: 'Scene Heading', runs: [{ text: '' }] }],
    rootAttributes: { ...DEFAULT_ROOT_ATTRIBUTES },
    passthroughDocumentChildren: [],
  }
}

/** Liefert den reinen Text eines Elements (z. B. für Outline/Sprungmarken). */
export function elementText(element: ScreenplayElement): string {
  return element.runs.map((run) => run.text).join('')
}
