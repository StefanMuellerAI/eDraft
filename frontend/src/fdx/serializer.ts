/**
 * FDX-Serializer: internes Modell → valide FDX-XML (FA-11).
 *
 * Gegenstück zu `parser.ts`; Round-Trip-Treue wird durch die Tests in
 * `__tests__/roundtrip.test.ts` abgesichert (NFA-4).
 */

import type { Screenplay, ScreenplayElement, TextRun } from './model'
import { DEFAULT_ROOT_ATTRIBUTES } from './model'
import { rgbToFdxColor } from './color'
import { createVisualizationElement } from './vizLink'

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'

/** Serialisiert das Drehbuch-Modell als FDX-XML-String. */
export function serializeFdx(screenplay: Screenplay): string {
  // Über DOMParser statt document.implementation erzeugt, damit in jeder
  // Umgebung garantiert ein XML-Dokument (kein HTML-Dokument) entsteht.
  const doc = new DOMParser().parseFromString('<FinalDraft/>', 'application/xml')
  const root = doc.documentElement

  const rootAttributes = { ...DEFAULT_ROOT_ATTRIBUTES, ...screenplay.rootAttributes }
  for (const [name, value] of Object.entries(rootAttributes)) {
    root.setAttribute(name, value)
  }

  const content = doc.createElementNS(null, 'Content')
  root.appendChild(content)
  for (const element of screenplay.elements) {
    content.appendChild(buildParagraph(doc, element))
  }

  for (const fragment of screenplay.passthroughDocumentChildren) {
    const node = importFragment(doc, fragment)
    if (node) root.appendChild(node)
  }

  return `${XML_DECLARATION}\n${new XMLSerializer().serializeToString(doc)}\n`
}

function buildParagraph(doc: Document, element: ScreenplayElement): Element {
  const paragraph = doc.createElementNS(null, 'Paragraph')
  paragraph.setAttribute('Type', element.originalType ?? element.type)

  for (const [name, value] of Object.entries(element.passthroughAttributes ?? {})) {
    paragraph.setAttribute(name, value)
  }

  if (element.note) {
    paragraph.appendChild(buildScriptNote(doc, element.note))
  }

  for (const run of element.runs) {
    paragraph.appendChild(buildText(doc, run))
  }

  if (element.visualizationUrl) {
    paragraph.appendChild(createVisualizationElement(doc, element.visualizationUrl))
  }

  for (const fragment of element.passthroughChildren ?? []) {
    const node = importFragment(doc, fragment)
    if (node) paragraph.appendChild(node)
  }

  return paragraph
}

function buildText(doc: Document, run: TextRun): Element {
  const text = doc.createElementNS(null, 'Text')

  const styles: string[] = []
  if (run.bold) styles.push('Bold')
  if (run.italic) styles.push('Italic')
  if (run.underline) styles.push('Underline')
  if (styles.length > 0) {
    text.setAttribute('Style', styles.join('+'))
  }

  if (run.color) {
    text.setAttribute('Color', rgbToFdxColor(run.color))
  }
  if (run.background) {
    text.setAttribute('Background', rgbToFdxColor(run.background))
  }

  for (const [name, value] of Object.entries(run.passthroughAttributes ?? {})) {
    text.setAttribute(name, value)
  }

  text.textContent = run.text
  return text
}

/** Baut eine `<ScriptNote>` mit einem inneren Paragraph je Notiz-Zeile (§6.5). */
function buildScriptNote(doc: Document, note: string): Element {
  const scriptNote = doc.createElementNS(null, 'ScriptNote')
  for (const line of note.split('\n')) {
    const paragraph = doc.createElementNS(null, 'Paragraph')
    const text = doc.createElementNS(null, 'Text')
    text.textContent = line
    paragraph.appendChild(text)
    scriptNote.appendChild(paragraph)
  }
  return scriptNote
}

/** Parst ein konserviertes XML-Fragment und importiert es in das Zieldokument. */
function importFragment(doc: Document, fragmentXml: string): Node | null {
  const parsed = new DOMParser().parseFromString(fragmentXml, 'application/xml')
  if (parsed.querySelector('parsererror')) return null
  return doc.importNode(parsed.documentElement, true)
}
