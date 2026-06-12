/**
 * Bidirektionales Mapping zwischen dem FDX-Modell (`src/fdx`) und dem
 * TipTap-Dokument-JSON. Die Dokument-Metadaten (Wurzel-Attribute,
 * Top-Level-Durchreiche) leben nicht im Editor, sondern im App-Store.
 */

import type { JSONContent } from '@tiptap/core'
import type { Screenplay, ScreenplayElement, TextRun } from '../fdx'
import { nodeNameForType, typeForNodeName, type ElementPassthrough } from './elementNodes'
import { decodeRunMeta, encodeRunMeta, type FdxRunMeta } from './fdxMetaMark'

/** FDX-Modell → TipTap-Dokument-JSON. */
export function screenplayToDocJson(screenplay: Screenplay): JSONContent {
  return {
    type: 'doc',
    content: screenplay.elements.map(elementToNode),
  }
}

function elementToNode(element: ScreenplayElement): JSONContent {
  const passthrough: ElementPassthrough = {}
  if (element.originalType) passthrough.originalType = element.originalType
  if (element.passthroughAttributes) passthrough.attributes = element.passthroughAttributes
  if (element.passthroughChildren) passthrough.children = element.passthroughChildren

  const content = element.runs
    .filter((run) => run.text.length > 0)
    .map(runToTextNode)

  return {
    type: nodeNameForType(element.type),
    attrs: {
      note: element.note ?? null,
      vizUrl: element.visualizationUrl ?? null,
      passthrough: Object.keys(passthrough).length > 0 ? passthrough : null,
    },
    ...(content.length > 0 ? { content } : {}),
  }
}

type JSONMark = { type: string; attrs?: Record<string, unknown> }

function runToTextNode(run: TextRun): JSONContent {
  const marks: JSONMark[] = []
  if (run.bold) marks.push({ type: 'bold' })
  if (run.italic) marks.push({ type: 'italic' })
  if (run.underline) marks.push({ type: 'underline' })
  if (run.color) marks.push({ type: 'textStyle', attrs: { color: run.color } })

  const meta: FdxRunMeta = {}
  if (run.background) meta.background = run.background
  if (run.passthroughAttributes) meta.attributes = run.passthroughAttributes
  if (Object.keys(meta).length > 0) {
    marks.push({ type: 'fdxMeta', attrs: { data: encodeRunMeta(meta) } })
  }

  return {
    type: 'text',
    text: run.text,
    ...(marks.length > 0 ? { marks } : {}),
  }
}

/** TipTap-Dokument-JSON → Liste der Drehbuch-Elemente. */
export function docJsonToElements(doc: JSONContent): ScreenplayElement[] {
  return (doc.content ?? []).map(nodeToElement)
}

function nodeToElement(node: JSONContent): ScreenplayElement {
  const element: ScreenplayElement = {
    type: typeForNodeName(node.type ?? 'general'),
    runs: [],
  }

  const attrs = node.attrs ?? {}
  if (typeof attrs.note === 'string' && attrs.note.length > 0) {
    element.note = attrs.note
  }
  if (typeof attrs.vizUrl === 'string' && attrs.vizUrl.length > 0) {
    element.visualizationUrl = attrs.vizUrl
  }

  const passthrough = attrs.passthrough as ElementPassthrough | null | undefined
  if (passthrough) {
    if (passthrough.originalType) element.originalType = passthrough.originalType
    if (passthrough.attributes) element.passthroughAttributes = passthrough.attributes
    if (passthrough.children) element.passthroughChildren = passthrough.children
  }

  for (const child of node.content ?? []) {
    if (child.type === 'text' && typeof child.text === 'string') {
      element.runs.push(textNodeToRun(child))
    }
  }
  if (element.runs.length === 0) {
    element.runs.push({ text: '' })
  }
  return element
}

function textNodeToRun(node: JSONContent): TextRun {
  const run: TextRun = { text: node.text ?? '' }
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        run.bold = true
        break
      case 'italic':
        run.italic = true
        break
      case 'underline':
        run.underline = true
        break
      case 'textStyle': {
        const color = (mark.attrs as { color?: string } | undefined)?.color
        if (color) run.color = color
        break
      }
      case 'fdxMeta': {
        const meta = decodeRunMeta((mark.attrs as { data?: string } | undefined)?.data)
        if (meta?.background) run.background = meta.background
        if (meta?.attributes) run.passthroughAttributes = meta.attributes
        break
      }
    }
  }
  return run
}
