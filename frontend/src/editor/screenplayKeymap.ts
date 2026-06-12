/**
 * Tastatur-Verhalten für schnelles Schreiben (FA-2):
 *
 * - Enter folgt dem Branchen-Flow (Scene Heading → Action, Character →
 *   Dialogue, Parenthetical → Dialogue, Transition → Scene Heading, …).
 * - Tab / Shift+Tab wechselt den Element-Typ zyklisch.
 * - Cmd/Ctrl+1…8 setzt den Element-Typ direkt.
 */

import { Extension, type Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { ELEMENT_NODE_NAMES } from './elementNodes'

/** Typ des Folge-Elements beim Drücken von Enter am Absatzende. */
const ENTER_FLOW: Record<string, string> = {
  sceneHeading: 'action',
  action: 'action',
  character: 'dialogue',
  dialogue: 'character',
  parenthetical: 'dialogue',
  transition: 'sceneHeading',
  shot: 'action',
  general: 'general',
}

function setCurrentElementType(editor: Editor, name: string, keepAttrs: boolean): boolean {
  const attrs = keepAttrs ? editor.state.selection.$from.parent.attrs : {}
  return editor.chain().focus().setNode(name, attrs).run()
}

function cycleElementType(editor: Editor, direction: 1 | -1): boolean {
  const current = editor.state.selection.$from.parent.type.name
  const index = ELEMENT_NODE_NAMES.indexOf(current)
  if (index === -1) return false
  const nextIndex =
    (index + direction + ELEMENT_NODE_NAMES.length) % ELEMENT_NODE_NAMES.length
  return setCurrentElementType(editor, ELEMENT_NODE_NAMES[nextIndex], true)
}

/** Verschiebt das aktuelle Element nach oben/unten (FA-4). */
export function moveCurrentElement(editor: Editor, direction: 1 | -1): boolean {
  const { state } = editor
  const doc = state.doc
  const index = state.selection.$from.index(0)
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= doc.childCount) return false

  const firstIndex = Math.min(index, targetIndex)
  let pos = 0
  for (let i = 0; i < firstIndex; i++) pos += doc.child(i).nodeSize
  const first = doc.child(firstIndex)
  const second = doc.child(firstIndex + 1)

  const tr = state.tr.delete(pos, pos + first.nodeSize + second.nodeSize)
  tr.insert(pos, [second, first])

  // Cursor folgt dem verschobenen Element.
  const movedPos = direction === -1 ? pos + 1 : pos + second.nodeSize + 1
  tr.setSelection(TextSelection.near(tr.doc.resolve(movedPos)))
  editor.view.dispatch(tr.scrollIntoView())
  return true
}

/** Löscht das aktuelle Element vollständig (FA-4). */
export function deleteCurrentElement(editor: Editor): boolean {
  const { state } = editor
  const doc = state.doc
  const index = state.selection.$from.index(0)
  let pos = 0
  for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize
  const node = doc.child(index)
  // Ist es das letzte Element, füllt ProseMirror das Dokument schema-konform
  // automatisch mit einem leeren Element auf.
  return editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
}

export const ScreenplayKeymap = Extension.create({
  name: 'screenplayKeymap',

  addKeyboardShortcuts() {
    const shortcuts: Record<string, ({ editor }: { editor: Editor }) => boolean> = {
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        const parent = $from.parent
        const atEnd = empty && $from.parentOffset === parent.content.size
        if (!atEnd) {
          // Mitten im Text: Standard-Split, Typ bleibt erhalten.
          return false
        }
        const next = ENTER_FLOW[parent.type.name] ?? parent.type.name
        // Neues Element ohne übernommene Notiz/Viz-Attribute beginnen.
        return editor.chain().splitBlock({ keepMarks: false }).setNode(next, {}).run()
      },
      Tab: ({ editor }) => cycleElementType(editor, 1),
      'Shift-Tab': ({ editor }) => cycleElementType(editor, -1),
      'Alt-ArrowUp': ({ editor }) => moveCurrentElement(editor, -1),
      'Alt-ArrowDown': ({ editor }) => moveCurrentElement(editor, 1),
    }

    ELEMENT_NODE_NAMES.forEach((name, i) => {
      shortcuts[`Mod-${i + 1}`] = ({ editor }) => setCurrentElementType(editor, name, true)
    })

    return shortcuts
  },
})
