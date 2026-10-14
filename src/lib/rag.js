// Public JSON API: no credentials, attachments, conversation upload or automatic retries.
const API_URL = (import.meta.env?.VITE_RAG_API_URL || 'https://qozon-api.qozontech.workers.dev').replace(/\/+$/, '')

export async function askRag({ question, signal }) {
  if (typeof question !== 'string' || !question.trim() || [...question].length > 200) {
    throw new Error('Enter a question of 1–200 characters.')
  }
  const res = await fetch(`${API_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ question }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.detail?.message || 'Question answering is unavailable.')
    error.status = res.status
    error.code = data?.detail?.code || 'request_failed'
    const retry = Number(res.headers.get('Retry-After'))
    error.retryAfter = Number.isInteger(retry) && retry > 0 ? retry : null
    throw error
  }
  if (typeof data?.answer !== 'string' || !data.answer.trim() ||
      (data.sources !== undefined && !Array.isArray(data.sources))) {
    throw new Error('The API returned an invalid response.')
  }
  const sources = data.sources ?? []
  if (sources.some(s => !s || typeof s.citation_id !== 'string' || typeof s.source !== 'string' ||
      !Array.isArray(s.physical_pages) || !s.physical_pages.length ||
      s.physical_pages.some(p => !Number.isInteger(p) || p < 1))) {
    throw new Error('The API returned invalid source citations.')
  }
  return { answer: data.answer, sources }
}

export function citationLinks(source) {
  return [...new Set([source.url, source.image_url, source.structured_url])].flatMap(url => {
    try {
      const parsed = new URL(url)
      // Only reviewed public citation file types; never original PDF links.
      return parsed.protocol === 'https:' && /\.(png|json|md)$/.test(parsed.pathname)
        ? [{ url, label: parsed.pathname.endsWith('.png') ? 'View image' : parsed.pathname.endsWith('.json') ? 'View table data' : 'View source' }]
        : []
    } catch { return [] }
  })
}
