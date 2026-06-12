/**
 * Szenen-Navigation (FA-5): Liste aller Scene Headings als Sprungmarken,
 * inklusive Hinweis auf hinterlegte Visualisierungs-Links (FA-16).
 */

import { useEditorState, type Editor } from '@tiptap/react'
import { t } from '../i18n'

interface SceneEntry {
  pos: number
  text: string
  vizUrl: string | null
}

interface OutlineSidebarProps {
  editor: Editor
}

export function OutlineSidebar({ editor }: OutlineSidebarProps) {
  const scenes = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const entries: SceneEntry[] = []
      currentEditor.state.doc.forEach((node, offset) => {
        if (node.type.name === 'sceneHeading') {
          entries.push({
            pos: offset,
            text: node.textContent,
            vizUrl: (node.attrs.vizUrl as string | null) ?? null,
          })
        }
      })
      return entries
    },
  })

  const jumpTo = (pos: number) => {
    editor.chain().focus().setTextSelection(pos + 1).scrollIntoView().run()
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <h2 className="border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {t.outline.title}
      </h2>
      <div className="flex-1 overflow-y-auto p-2">
        {scenes.length === 0 && (
          <p className="px-2 py-3 text-xs text-zinc-400">{t.outline.empty}</p>
        )}
        <ol>
          {scenes.map((scene, index) => (
            <li key={`${scene.pos}-${index}`}>
              <button
                type="button"
                onClick={() => jumpTo(scene.pos)}
                className="group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100"
              >
                <span className="mt-0.5 shrink-0 text-xs tabular-nums text-zinc-400">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-700">
                  {scene.text || '—'}
                </span>
                {scene.vizUrl && (
                  <a
                    href={scene.vizUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.outline.hasViz}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-0.5 shrink-0 rounded bg-sky-100 px-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-200"
                  >
                    VIZ
                  </a>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}
