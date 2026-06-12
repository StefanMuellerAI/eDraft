/**
 * Eigenschaften-Panel für das aktuelle Element: freie Notiz (FA-14) und —
 * bei Szenenüberschriften — der Visualisierungs-Link (FA-15/FA-16).
 */

import { useEditorState, type Editor } from '@tiptap/react'
import { typeForNodeName } from '../editor'
import { t } from '../i18n'

interface InspectorPanelProps {
  editor: Editor
}

export function InspectorPanel({ editor }: InspectorPanelProps) {
  const current = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const parent = currentEditor.state.selection.$from.parent
      return {
        nodeName: parent.type.name,
        note: (parent.attrs.note as string | null) ?? '',
        vizUrl: (parent.attrs.vizUrl as string | null) ?? '',
      }
    },
  })

  const updateAttribute = (name: 'note' | 'vizUrl', value: string) => {
    editor.commands.updateAttributes(current.nodeName, { [name]: value || null })
  }

  const isSceneHeading = current.nodeName === 'sceneHeading'

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
      <h2 className="border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {t.inspector.title}
      </h2>
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <p className="text-xs text-zinc-500">
          {t.toolbar.elementType}:{' '}
          <span className="font-medium text-zinc-800">
            {t.elements[typeForNodeName(current.nodeName)]}
          </span>
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            {t.inspector.noteLabel}
          </span>
          <textarea
            value={current.note}
            onChange={(event) => updateAttribute('note', event.target.value)}
            placeholder={t.inspector.notePlaceholder}
            rows={6}
            className="w-full resize-y rounded-md border border-zinc-300 p-2 text-sm leading-snug focus:border-zinc-500 focus:outline-none"
          />
        </label>

        {isSceneHeading ? (
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              {t.inspector.vizLabel}
            </span>
            <input
              type="url"
              value={current.vizUrl}
              onChange={(event) => updateAttribute('vizUrl', event.target.value)}
              placeholder={t.inspector.vizPlaceholder}
              className="w-full rounded-md border border-zinc-300 p-2 font-mono text-xs focus:border-zinc-500 focus:outline-none"
            />
            {current.vizUrl && (
              <a
                href={current.vizUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-sky-600 underline hover:text-sky-800"
              >
                {t.inspector.vizOpen}
              </a>
            )}
          </label>
        ) : (
          <p className="text-xs text-zinc-400">{t.inspector.vizOnlyScene}</p>
        )}
      </div>
    </aside>
  )
}
