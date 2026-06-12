/**
 * TipTap-Node-Typen für die 8 FDX-Paragraph-Typen (FA-1).
 *
 * Jedes Drehbuch-Element ist ein eigener Block-Node mit den Attributen
 * `note` (FA-14), `vizUrl` (FA-15) und `passthrough` (FDX-Durchreiche,
 * FA-12). Das Schema mappt damit 1:1 auf das FDX-`Paragraph Type`-Modell.
 */

import { Node, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import type { ParagraphType } from '../fdx'
import { PARAGRAPH_TYPES } from '../fdx'

/** Konservierte FDX-Daten eines Elements (nicht editierbar, nur Durchreiche). */
export interface ElementPassthrough {
  originalType?: string
  attributes?: Record<string, string>
  children?: string[]
}

const NODE_NAMES: Record<ParagraphType, string> = {
  'Scene Heading': 'sceneHeading',
  Action: 'action',
  Character: 'character',
  Dialogue: 'dialogue',
  Parenthetical: 'parenthetical',
  Transition: 'transition',
  Shot: 'shot',
  General: 'general',
}

const PARAGRAPH_TYPES_BY_NODE_NAME = Object.fromEntries(
  Object.entries(NODE_NAMES).map(([paragraphType, nodeName]) => [nodeName, paragraphType]),
) as Record<string, ParagraphType>

export function nodeNameForType(type: ParagraphType): string {
  return NODE_NAMES[type]
}

export function typeForNodeName(nodeName: string): ParagraphType {
  return PARAGRAPH_TYPES_BY_NODE_NAME[nodeName] ?? 'General'
}

/** Node-Namen in der Reihenfolge der FDX-Typen (für Tab-Zyklus, Cmd+1…8). */
export const ELEMENT_NODE_NAMES: string[] = PARAGRAPH_TYPES.map((t) => NODE_NAMES[t])

function createElementNode(type: ParagraphType) {
  const name = NODE_NAMES[type]
  return Node.create({
    name,
    group: 'block screenplayElement',
    content: 'inline*',

    addAttributes() {
      return {
        note: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-note'),
          renderHTML: (attrs) => (attrs.note ? { 'data-note': attrs.note } : {}),
        },
        vizUrl: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-viz-url'),
          renderHTML: (attrs) => (attrs.vizUrl ? { 'data-viz-url': attrs.vizUrl } : {}),
        },
        // Wird nicht gerendert; lebt nur im Dokument-JSON (FDX-Durchreiche).
        passthrough: {
          default: null,
          rendered: false,
        },
      }
    },

    parseHTML() {
      return [{ tag: `p[data-sp-type="${name}"]` }]
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'p',
        mergeAttributes(HTMLAttributes, { 'data-sp-type': name, class: `sp-${name}` }),
        0,
      ]
    },
  })
}

/** Alle 8 Element-Nodes. */
export const elementNodes = PARAGRAPH_TYPES.map(createElementNode)

/** Dokument-Node: ein Drehbuch ist eine Folge von Drehbuch-Elementen. */
export const ScreenplayDocument = Document.extend({
  content: 'screenplayElement+',
})
