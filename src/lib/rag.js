// Client for the Multimodal RAG backend.
// Set VITE_RAG_API_URL (e.g. in Cloudflare Pages env vars) to point at your LangChain API.
// Expected response JSON: { answer: string, sources?: [{ title, snippet?, url? }] }

const API_URL = import.meta.env.VITE_RAG_API_URL

export const isConnected = Boolean(API_URL)

export async function askRag({ question, files }) {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 900))
    return {
      answer:
        'The Multimodal RAG backend is not connected yet. Once it is live, your question' +
        (files.length ? ` and ${files.length} attached file${files.length > 1 ? 's' : ''}` : '') +
        ' will be sent to the LangChain pipeline and the grounded answer will appear here.',
      sources: [],
      demo: true,
    }
  }

  const body = new FormData()
  body.append('question', question)
  files.forEach((f) => body.append('files', f))

  const res = await fetch(API_URL, { method: 'POST', body })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
