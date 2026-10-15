// Separate API for the supervisor and PDF subagent; browser requests carry no keys.
import { askRag } from './rag'

const API_URL = (import.meta.env?.VITE_SUBAGENT_RAG_API_URL || 'https://qozon-multi-agent-api.qozontech.workers.dev').replace(/\/+$/, '')

export function askSubagentRag({ question, signal }) {
  return askRag({ question, signal, apiUrl: API_URL })
}
