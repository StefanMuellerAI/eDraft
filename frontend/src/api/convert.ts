/**
 * API-Client für den Konverter-Endpunkt (FA-19/FA-21, §8).
 *
 * Der Vertrag ist stabil definiert: Die spätere echte KI-Implementierung
 * ersetzt den Mock serverseitig, ohne dass dieser Client sich ändert.
 */

export interface ConvertSuccess {
  status: 'ok'
  fdx_xml: string
  warnings: string[]
}

export interface ConvertNotImplemented {
  status: 'not_implemented'
  message: string
  fdx_xml?: string
}

export interface ConvertError {
  status: 'error'
  message: string
}

export type ConvertResponse = ConvertSuccess | ConvertNotImplemented | ConvertError

const CONVERT_URL = '/api/v1/convert'

/**
 * Lädt eine Datei zum Konvertierungs-Endpunkt hoch.
 * Wirft nur bei Netzwerkfehlern; fachliche Fehler kommen als `status: error`.
 */
export async function convertDocument(file: File): Promise<ConvertResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('source_format', 'auto')

  const response = await fetch(CONVERT_URL, { method: 'POST', body: formData })

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { status: 'error', message: `Unerwartete Antwort (HTTP ${response.status})` }
  }

  const parsed = body as Partial<ConvertResponse>
  if (
    parsed.status === 'ok' ||
    parsed.status === 'not_implemented' ||
    parsed.status === 'error'
  ) {
    return parsed as ConvertResponse
  }
  return { status: 'error', message: `Unerwartete Antwort (HTTP ${response.status})` }
}
