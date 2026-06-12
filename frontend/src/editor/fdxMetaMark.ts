/**
 * Unsichtbare Mark, die FDX-Durchreiche-Daten eines Text-Runs konserviert
 * (z. B. `Font`, `Size`, `RevisionID` sowie die optionale `Background`-Farbe).
 *
 * Dadurch überleben diese Informationen die Editor-Bearbeitung und werden
 * beim Export unverändert zurückgeschrieben (FA-12).
 */

import { Mark } from '@tiptap/core'

export interface FdxRunMeta {
  /** Hintergrundfarbe als 24-Bit-Hex (FA-8), falls vorhanden. */
  background?: string
  /** Unbekannte `<Text>`-Attribute. */
  attributes?: Record<string, string>
}

export const FdxMeta = Mark.create({
  name: 'fdxMeta',

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-fdx-meta'),
        renderHTML: (attrs) => (attrs.data ? { 'data-fdx-meta': attrs.data } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-fdx-meta]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
})

export function encodeRunMeta(meta: FdxRunMeta): string {
  return JSON.stringify(meta)
}

export function decodeRunMeta(data: string | null | undefined): FdxRunMeta | undefined {
  if (!data) return undefined
  try {
    return JSON.parse(data) as FdxRunMeta
  } catch {
    return undefined
  }
}
