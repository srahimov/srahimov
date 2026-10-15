// Client for the Multimodal Subagent RAG backend.
// Set VITE_SUBAGENT_RAG_API_URL to the API base URL; until then the page runs in demo mode.
// Expected: POST {base}/questions { question } → { answer, steps?: [{ agent, summary }], sources?: [{ title, url? }] }

const API_URL = (import.meta.env?.VITE_SUBAGENT_RAG_API_URL || '').replace(/\/+$/, '')

export const isConnected = Boolean(API_URL)

export const subagents = [
  { agent: 'Supervisor', summary: 'Plans the question and routes it to specialist subagents.' },
  { agent: 'Text retriever', summary: 'Searches passages and documents for relevant context.' },
  { agent: 'Vision agent', summary: 'Inspects images, figures and scanned pages.' },
  { agent: 'Table agent', summary: 'Reads structured tables and extracts values.' },
  { agent: 'Synthesizer', summary: 'Merges subagent findings into one grounded answer.' },
]

export async function askSubagentRag({ question, signal }) {
  if (!question.trim() || [...question].length > 200) {
    throw new Error('Enter a question of 1–200 characters.')
  }

  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 1800))
    return {
      answer:
        'The Multimodal Subagent RAG backend is not connected yet. Once it is live, the supervisor will route your ' +
        'question to the text, vision and table subagents and the grounded answer will appear here.',
      steps: [],
      sources: [],
    }
  }

  const res = await fetch(`${API_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ question }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90_000)]) : AbortSignal.timeout(90_000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(data?.detail?.message || 'Question answering is unavailable.')
    error.status = res.status
    throw error
  }
  if (typeof data?.answer !== 'string' || !data.answer.trim()) {
    throw new Error('The API returned an invalid response.')
  }
  return {
    answer: data.answer,
    steps: Array.isArray(data.steps) ? data.steps : [],
    sources: Array.isArray(data.sources) ? data.sources : [],
  }
}
