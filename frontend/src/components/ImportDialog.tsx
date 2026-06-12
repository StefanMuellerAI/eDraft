/**
 * Dialog „Dokument importieren (Word/PDF → FDX)" (FA-18 bis FA-21).
 *
 * Die Konvertierung läuft ausschließlich über den Backend-Endpunkt
 * `POST /api/v1/convert`. Im Demo-Modus antwortet der Mock entweder mit
 * einer Beispiel-FDX oder mit `not_implemented` — beide Fälle werden hier
 * deutlich sichtbar behandelt.
 */

import { useRef, useState } from 'react'
import { convertDocument, type ConvertResponse } from '../api/convert'
import { t } from '../i18n'

interface ImportDialogProps {
  onClose: () => void
  /** Lädt das gelieferte FDX-XML in den Editor (gleicher Pfad wie FDX-Upload). */
  onLoadFdx: (fdxXml: string, sourceName: string) => void
}

type DialogState =
  | { phase: 'idle' }
  | { phase: 'converting' }
  | { phase: 'done'; response: ConvertResponse; fileName: string }
  | { phase: 'failed'; message: string }

export function ImportDialog({ onClose, onLoadFdx }: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [state, setState] = useState<DialogState>({ phase: 'idle' })

  const submit = async () => {
    if (!selectedFile) return
    setState({ phase: 'converting' })
    try {
      const response = await convertDocument(selectedFile)
      setState({ phase: 'done', response, fileName: selectedFile.name })
      if (response.status === 'ok') {
        onLoadFdx(response.fdx_xml, selectedFile.name)
      }
    } catch {
      setState({ phase: 'failed', message: t.importDialog.networkError })
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-900">{t.importDialog.title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t.importDialog.description}</p>

        <div className="mt-4 flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-zinc-700"
          />

          {state.phase === 'converting' && (
            <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
              {t.importDialog.converting}
            </p>
          )}

          {state.phase === 'done' && state.response.status === 'ok' && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {t.importDialog.success}
            </p>
          )}

          {state.phase === 'done' && state.response.status === 'not_implemented' && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
              <p className="text-sm font-medium text-amber-800">{t.importDialog.demoNotice}</p>
              <p className="mt-1 text-xs text-amber-700">{state.response.message}</p>
              {state.response.fdx_xml && (
                <button
                  type="button"
                  onClick={() => {
                    if (state.response.status === 'not_implemented' && state.response.fdx_xml) {
                      onLoadFdx(state.response.fdx_xml, state.fileName)
                      onClose()
                    }
                  }}
                  className="mt-2 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                >
                  {t.importDialog.loadPlaceholder}
                </button>
              )}
            </div>
          )}

          {((state.phase === 'done' && state.response.status === 'error') ||
            state.phase === 'failed') && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.phase === 'failed'
                ? state.message
                : (state.response as { message?: string }).message || t.importDialog.genericError}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            {t.importDialog.cancel}
          </button>
          <button
            type="button"
            disabled={!selectedFile || state.phase === 'converting'}
            onClick={submit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.importDialog.submit}
          </button>
        </div>
      </div>
    </div>
  )
}
