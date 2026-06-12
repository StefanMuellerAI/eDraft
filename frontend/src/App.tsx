/**
 * Hauptkomponente: Editor-Layout, Datei-Handling (FA-9/10/11/13) und
 * Anbindung des Import-Dialogs (FA-18 ff.).
 */

import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import {
  createEmptyScreenplay,
  parseFdx,
  serializeFdx,
  FdxParseError,
  type Screenplay,
} from './fdx'
import {
  buildEditorExtensions,
  docJsonToElements,
  screenplayToDocJson,
  typeForNodeName,
} from './editor'
import { useDocumentStore } from './store/documentStore'
import { useAuth } from './auth/AuthContext'
import { t } from './i18n'
import { Toolbar } from './components/Toolbar'
import { OutlineSidebar } from './components/OutlineSidebar'
import { InspectorPanel } from './components/InspectorPanel'
import { ImportDialog } from './components/ImportDialog'

const extensions = buildEditorExtensions({
  placeholder: (nodeName) => t.elements[typeForNodeName(nodeName)],
})

export default function App() {
  const { canUseEditor } = useAuth()
  const store = useDocumentStore()
  const [importOpen, setImportOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions,
    content: screenplayToDocJson(createEmptyScreenplay()),
    editable: canUseEditor,
    onUpdate: () => useDocumentStore.getState().markDirty(),
  })

  const stats = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return { scenes: 0, elements: 0 }
      let scenes = 0
      currentEditor.state.doc.forEach((node) => {
        if (node.type.name === 'sceneHeading') scenes += 1
      })
      return { scenes, elements: currentEditor.state.doc.childCount }
    },
  })

  // FA-13: Warnung bei ungespeicherten Änderungen vor Verlassen/Neuladen.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (useDocumentStore.getState().dirty) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  if (!editor) return null

  const loadScreenplay = (screenplay: Screenplay, fileName: string | null) => {
    editor.commands.setContent(screenplayToDocJson(screenplay))
    store.adoptScreenplay(screenplay, fileName)
    useDocumentStore.getState().markClean()
    setFileError(null)
    editor.commands.focus('start')
  }

  const loadFdxString = (fdxXml: string, sourceName: string) => {
    try {
      loadScreenplay(parseFdx(fdxXml), sourceName)
    } catch (error) {
      setFileError(
        `${t.file.openError} ${error instanceof FdxParseError ? error.message : String(error)}`,
      )
    }
  }

  const handleNew = () => {
    if (store.dirty && !window.confirm(t.file.newConfirm)) return
    loadScreenplay(createEmptyScreenplay(), null)
  }

  const handleOpenFile = async (file: File) => {
    loadFdxString(await file.text(), file.name)
  }

  const handleExport = () => {
    const screenplay: Screenplay = {
      elements: docJsonToElements(editor.getJSON()),
      rootAttributes: store.rootAttributes,
      passthroughDocumentChildren: store.passthroughDocumentChildren,
    }
    const xml = serializeFdx(screenplay)
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    // Endung immer auf .fdx normalisieren — der Dokumentname kann z. B. vom
    // Word/PDF-Import stammen (szene.docx) und behält sonst die Fremd-Endung.
    const baseName = (store.fileName ?? 'drehbuch').replace(/\.[^.]+$/, '')
    anchor.download = `${baseName}.fdx`
    anchor.click()
    URL.revokeObjectURL(url)
    store.markClean()
  }

  const headerButton =
    'rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700'

  return (
    <div className="flex h-screen flex-col bg-zinc-100 text-zinc-900">
      <header className="flex items-center gap-3 bg-zinc-900 px-4 py-2.5">
        <h1 className="text-lg font-semibold text-white">
          {t.app.title}
          <span className="ml-2 text-xs font-normal text-zinc-400">{t.app.subtitle}</span>
        </h1>
        <span className="ml-2 truncate text-sm text-zinc-400">
          {store.fileName ?? t.app.untitled}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={handleNew} className={headerButton}>
            {t.file.new}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={headerButton}
          >
            {t.file.open}
          </button>
          <button type="button" onClick={() => setImportOpen(true)} className={headerButton}>
            {t.file.import}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            {t.file.export}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".fdx,application/xml,text/xml"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleOpenFile(file)
            event.target.value = ''
          }}
        />
      </header>

      <Toolbar editor={editor} />

      {fileError && (
        <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {fileError}
        </p>
      )}

      <main className="flex min-h-0 flex-1">
        <OutlineSidebar editor={editor} />
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="screenplay-page mx-auto min-h-full max-w-3xl rounded-sm bg-white shadow-md">
            <EditorContent editor={editor} className="screenplay-editor" />
          </div>
        </div>
        <InspectorPanel editor={editor} />
      </main>

      <footer className="flex items-center gap-4 border-t border-zinc-200 bg-white px-4 py-1.5 text-xs text-zinc-500">
        <span>
          {stats.scenes} {t.status.scenes} · {stats.elements} {t.status.elements}
        </span>
        <span className={`ml-auto ${store.dirty ? 'text-amber-600' : 'text-green-600'}`}>
          {store.dirty ? t.status.unsaved : t.status.saved}
        </span>
      </footer>

      {importOpen && (
        <ImportDialog
          onClose={() => setImportOpen(false)}
          onLoadFdx={(fdxXml, sourceName) => {
            if (store.dirty && !window.confirm(t.importDialog.replaceWarning)) return
            loadFdxString(fdxXml, sourceName)
            setImportOpen(false)
          }}
        />
      )}
    </div>
  )
}
