/**
 * FDX-Parser: FDX-XML → internes Modell (FA-9).
 *
 * Toleranz-Prinzip (FA-12): Unbekannte Elemente und Attribute führen nie zum
 * Abbruch. Sie werden — wo ohne Semantikverlust möglich — als Durchreiche
 * konserviert, damit der Export sie unverändert zurückschreibt; andernfalls
 * werden sie ignoriert. Nur strukturell unbrauchbares XML wirft einen
 * `FdxParseError`.
 */

import type { Screenplay, ScreenplayElement, TextRun } from './model'
import { isParagraphType } from './model'
import { tryFdxColorToRgb } from './color'
import { VIZ_ELEMENT_NAME, readVisualizationUrl } from './vizLink'

export class FdxParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FdxParseError'
  }
}

/** Parst einen FDX-XML-String in das interne Drehbuch-Modell. */
export function parseFdx(xml: string): Screenplay {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new FdxParseError('Die Datei enthält kein wohlgeformtes XML.')
  }

  const root = doc.documentElement
  if (!root || root.tagName !== 'FinalDraft') {
    throw new FdxParseError('Die Datei ist keine FDX-Datei (Wurzelelement <FinalDraft> fehlt).')
  }

  const rootAttributes = readAttributes(root)
  const elements: ScreenplayElement[] = []
  const passthroughDocumentChildren: string[] = []
  const serializer = new XMLSerializer()

  for (const child of elementChildren(root)) {
    if (child.tagName === 'Content') {
      for (const contentChild of elementChildren(child)) {
        if (contentChild.tagName === 'Paragraph') {
          elements.push(parseParagraph(contentChild, serializer))
        }
        // Andere Kinder von <Content> werden bewusst ignoriert (FA-12):
        // ein Durchreichen außerhalb von <Content> würde die Struktur ändern.
      }
    } else {
      // TitlePage, ElementSettings, HeaderAndFooter, … unverändert konservieren.
      passthroughDocumentChildren.push(serializer.serializeToString(child))
    }
  }

  return { elements, rootAttributes, passthroughDocumentChildren }
}

function parseParagraph(paragraph: Element, serializer: XMLSerializer): ScreenplayElement {
  const typeAttribute = paragraph.getAttribute('Type') ?? 'General'
  const known = isParagraphType(typeAttribute)

  const element: ScreenplayElement = {
    type: known ? typeAttribute : 'General',
    runs: [],
  }
  if (!known) {
    element.originalType = typeAttribute
  }

  const passthroughAttributes = readAttributes(paragraph, ['Type'])
  if (Object.keys(passthroughAttributes).length > 0) {
    element.passthroughAttributes = passthroughAttributes
  }

  const noteParts: string[] = []
  const passthroughChildren: string[] = []

  for (const child of elementChildren(paragraph)) {
    switch (child.tagName) {
      case 'Text':
        element.runs.push(parseTextRun(child))
        break
      case 'ScriptNote': {
        const note = readScriptNoteText(child)
        if (note) noteParts.push(note)
        break
      }
      case VIZ_ELEMENT_NAME: {
        const url = readVisualizationUrl(child)
        if (url) element.visualizationUrl = url
        break
      }
      default:
        passthroughChildren.push(serializer.serializeToString(child))
    }
  }

  if (noteParts.length > 0) {
    element.note = noteParts.join('\n')
  }
  if (passthroughChildren.length > 0) {
    element.passthroughChildren = passthroughChildren
  }
  if (element.runs.length === 0) {
    element.runs.push({ text: '' })
  }
  return element
}

function parseTextRun(textElement: Element): TextRun {
  const run: TextRun = { text: textElement.textContent ?? '' }

  const style = textElement.getAttribute('Style')
  if (style) {
    // Übliches Trennzeichen ist "+" (z. B. "Bold+Italic"); Kommata und
    // Leerzeichen werden tolerant ebenfalls akzeptiert (FA-12).
    const styles = style.split(/[+,\s]+/).map((s) => s.trim().toLowerCase())
    if (styles.includes('bold')) run.bold = true
    if (styles.includes('italic')) run.italic = true
    if (styles.includes('underline')) run.underline = true
  }

  const color = tryFdxColorToRgb(textElement.getAttribute('Color'))
  if (color) run.color = color
  const background = tryFdxColorToRgb(textElement.getAttribute('Background'))
  if (background) run.background = background

  const passthrough = readAttributes(textElement, ['Style', 'Color', 'Background'])
  if (Object.keys(passthrough).length > 0) {
    run.passthroughAttributes = passthrough
  }
  return run
}

/**
 * Liest den Notiztext aus einer `<ScriptNote>`: alle enthaltenen `<Text>`-
 * Knoten, absatzweise mit Zeilenumbruch verbunden (§6.5).
 */
function readScriptNoteText(scriptNote: Element): string {
  const lines: string[] = []
  const innerParagraphs = scriptNote.getElementsByTagName('Paragraph')
  if (innerParagraphs.length > 0) {
    for (const paragraph of Array.from(innerParagraphs)) {
      // Pretty-Print-Einrückung der Quelldatei gehört nicht zur Notiz.
      lines.push((paragraph.textContent ?? '').trim())
    }
  } else {
    // Tolerante Behandlung flacher Strukturen: <ScriptNote>Text</ScriptNote>
    lines.push((scriptNote.textContent ?? '').trim())
  }
  return lines.join('\n').trim()
}

function readAttributes(element: Element, exclude: string[] = []): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const attribute of Array.from(element.attributes)) {
    if (!exclude.includes(attribute.name)) {
      attributes[attribute.name] = attribute.value
    }
  }
  return attributes
}

function elementChildren(element: Element): Element[] {
  return Array.from(element.children)
}
