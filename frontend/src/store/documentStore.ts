/**
 * App-Zustand außerhalb des Editor-Dokuments: Dokument-Metadaten für den
 * FDX-Export (Wurzel-Attribute, Top-Level-Durchreiche), Dateiname und
 * Dirty-Flag für die Warnung bei ungespeicherten Änderungen (FA-13).
 */

import { create } from 'zustand'
import { DEFAULT_ROOT_ATTRIBUTES, type Screenplay } from '../fdx'

interface DocumentState {
  rootAttributes: Record<string, string>
  passthroughDocumentChildren: string[]
  fileName: string | null
  dirty: boolean

  /** Übernimmt Metadaten eines frisch geladenen Drehbuchs. */
  adoptScreenplay: (screenplay: Screenplay, fileName: string | null) => void
  resetToNew: () => void
  markDirty: () => void
  markClean: () => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  rootAttributes: { ...DEFAULT_ROOT_ATTRIBUTES },
  passthroughDocumentChildren: [],
  fileName: null,
  dirty: false,

  adoptScreenplay: (screenplay, fileName) =>
    set({
      rootAttributes: screenplay.rootAttributes,
      passthroughDocumentChildren: screenplay.passthroughDocumentChildren,
      fileName,
      dirty: false,
    }),

  resetToNew: () =>
    set({
      rootAttributes: { ...DEFAULT_ROOT_ATTRIBUTES },
      passthroughDocumentChildren: [],
      fileName: null,
      dirty: false,
    }),

  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),
}))
