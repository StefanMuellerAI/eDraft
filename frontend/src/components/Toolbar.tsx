/**
 * Editor-Werkzeugleiste: Element-Typ (FA-2), Zeichenstile (FA-6),
 * Textfarbe (FA-7), Verschieben/Löschen von Elementen (FA-4).
 */

import { useEditorState, type Editor } from '@tiptap/react'
import {
  ELEMENT_NODE_NAMES,
  typeForNodeName,
  moveCurrentElement,
  deleteCurrentElement,
} from '../editor'
import { t } from '../i18n'
import { ColorPicker } from './ColorPicker'

interface ToolbarProps {
  editor: Editor
}

function styleButtonClass(active: boolean): string {
  return `flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors ${
    active
      ? 'border-zinc-800 bg-zinc-800 text-white'
      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
  }`
}

export function Toolbar({ editor }: ToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      nodeName: currentEditor.state.selection.$from.parent.type.name,
      bold: currentEditor.isActive('bold'),
      italic: currentEditor.isActive('italic'),
      underline: currentEditor.isActive('underline'),
      color: (currentEditor.getAttributes('textStyle').color as string | undefined) ?? null,
    }),
  })

  const setElementType = (name: string) => {
    const attrs = editor.state.selection.$from.parent.attrs
    editor.chain().focus().setNode(name, attrs).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2">
      <label className="flex items-center gap-2 text-xs text-zinc-500">
        {t.toolbar.elementType}
        <select
          value={state.nodeName}
          onChange={(event) => setElementType(event.target.value)}
          className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
        >
          {ELEMENT_NODE_NAMES.map((name, index) => (
            <option key={name} value={name}>
              {t.elements[typeForNodeName(name)]} (⌘{index + 1})
            </option>
          ))}
        </select>
      </label>

      <div className="h-6 w-px bg-zinc-300" />

      <button
        type="button"
        title={t.toolbar.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={styleButtonClass(state.bold)}
      >
        <span className="font-bold">F</span>
      </button>
      <button
        type="button"
        title={t.toolbar.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={styleButtonClass(state.italic)}
      >
        <span className="italic">K</span>
      </button>
      <button
        type="button"
        title={t.toolbar.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={styleButtonClass(state.underline)}
      >
        <span className="underline">U</span>
      </button>

      <ColorPicker
        color={state.color}
        onApply={(color) => editor.chain().focus().setColor(color).run()}
        onReset={() => editor.chain().focus().unsetColor().run()}
      />

      <div className="h-6 w-px bg-zinc-300" />

      <button
        type="button"
        title={t.toolbar.moveUp}
        onClick={() => moveCurrentElement(editor, -1)}
        className={styleButtonClass(false)}
      >
        ↑
      </button>
      <button
        type="button"
        title={t.toolbar.moveDown}
        onClick={() => moveCurrentElement(editor, 1)}
        className={styleButtonClass(false)}
      >
        ↓
      </button>
      <button
        type="button"
        title={t.toolbar.deleteElement}
        onClick={() => deleteCurrentElement(editor)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm text-red-600 hover:bg-red-50"
      >
        ✕
      </button>

      <p className="ml-auto hidden text-xs text-zinc-400 lg:block">{t.toolbar.shortcutHint}</p>
    </div>
  )
}
