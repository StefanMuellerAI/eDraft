/**
 * Persistenz-Naht (§9, NFA-7): Repository-Schnittstelle für künftiges
 * serverseitiges Speichern/Öffnen von Drehbüchern.
 *
 * Im MVP existiert KEINE Implementierung — die Anwendung arbeitet rein mit
 * Datei-Upload/-Download. Die spätere Umsetzung (PostgreSQL hinter einer
 * Backend-API) implementiert dieses Interface; UI-Code, der „Speichern/
 * Öffnen" anbietet, programmiert dann gegen `ScreenplayRepository`.
 *
 * Datenmodell-Skizze (§11):
 * - Screenplay: id, title, owner_id (aus SSO), fdx_xml, created_at, updated_at
 * - User:       id, external_idp_subject, display_name, role
 * - optional SceneVisualization: screenplay_id, scene_ref, url
 */

export interface ScreenplaySummary {
  id: string
  title: string
  updatedAt: string
}

export interface StoredScreenplay extends ScreenplaySummary {
  /** Vollständiges Drehbuch als FDX-XML (Format der Demo beibehalten). */
  fdxXml: string
}

export interface ScreenplayRepository {
  save(screenplay: { id?: string; title: string; fdxXml: string }): Promise<ScreenplaySummary>
  load(id: string): Promise<StoredScreenplay>
  list(): Promise<ScreenplaySummary[]>
  remove(id: string): Promise<void>
}

/**
 * Aktive Repository-Implementierung. Im MVP bewusst `null`; die UI blendet
 * Speichern/Öffnen-Funktionen nur ein, wenn ein Repository vorhanden ist.
 */
export const screenplayRepository: ScreenplayRepository | null = null
