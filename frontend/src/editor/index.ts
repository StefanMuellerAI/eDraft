/**
 * Zusammenstellung aller TipTap-Extensions für den Drehbuch-Editor.
 */

import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { UndoRedo, Dropcursor, Gapcursor, Placeholder } from '@tiptap/extensions'
import { ScreenplayDocument, elementNodes } from './elementNodes'
import { FdxMeta } from './fdxMetaMark'
import { ScreenplayKeymap } from './screenplayKeymap'

export interface EditorExtensionOptions {
  /** Liefert den Platzhalter-Text für ein leeres Element (z. B. den Typ-Namen). */
  placeholder?: (nodeName: string) => string
}

export function buildEditorExtensions(options: EditorExtensionOptions = {}) {
  return [
    ScreenplayDocument,
    Text,
    ...elementNodes,
    Bold,
    Italic,
    Underline,
    TextStyle,
    Color,
    FdxMeta,
    ScreenplayKeymap,
    UndoRedo,
    Dropcursor,
    Gapcursor,
    Placeholder.configure({
      placeholder: ({ node }) => options.placeholder?.(node.type.name) ?? '',
    }),
  ]
}

export { moveCurrentElement, deleteCurrentElement } from './screenplayKeymap'
export {
  nodeNameForType,
  typeForNodeName,
  ELEMENT_NODE_NAMES,
  type ElementPassthrough,
} from './elementNodes'
export { screenplayToDocJson, docJsonToElements } from './conversion'
