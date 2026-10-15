import { useEffect, useRef, useState } from 'react'
import { ArrowIcon } from '../components/Icons'
import { citationLinks } from '../lib/rag'
import { askSubagentRag } from '../lib/subagentRag'

const examples = [
  "According to the translator's preface, what are the two purposes of this treatise?",
  "What topics are listed in the book's table of contents?",
  'Describe the illustration of a physician and his patient.',
]

function SourcePreview({ link, source }) {
  const image = new URL(link.url).pathname.endsWith('.png')
  const [preview, setPreview] = useState(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    if (image) return
    const controller = new AbortController()
    setPreview(null)
    setUnavailable(false)
    // Only approved public excerpt links from the API; no browser credentials.
    fetch(link.url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
    }).then(async (response) => {
      if (!response.ok) throw new Error('Source preview unavailable')
      const text = await response.text()
      if (!controller.signal.aborted) setPreview(text)
    }).catch(() => {
      if (!controller.signal.aborted) setUnavailable(true)
    })
    return () => controller.abort()
  }, [link.url, image])

  if (unavailable) return <p className="source-preview-note">Preview unavailable. Use the source link above.</p>
  if (image) return (
    <figure className="source-preview">
      <img src={link.url} alt={`${source.citation_id}: ${source.source}, page ${source.physical_pages.join(', ')}`}
        loading="lazy" referrerPolicy="no-referrer" onError={() => setUnavailable(true)} />
      <figcaption>{source.content_type === 'table_summary' ? 'Source table' : 'Source image'} · {source.citation_id}</figcaption>
    </figure>
  )
  return preview === null
    ? <p className="source-preview-note">Loading source preview…</p>
    : <pre className="source-excerpt">{preview}</pre>
}

export default function MultimodalSubagentRag() {
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [asked, setAsked] = useState('')
  const requestRef = useRef(null)
  const length = [...question].length
  const responseRef = useRef(null)

  useEffect(() => {
    document.title = 'Multimodal Subagent RAG · S. Rahimov'
    return () => requestRef.current?.abort()
  }, [])

  const submit = async (e) => {
    e?.preventDefault()
    if (!question.trim() || length > 200 || requestRef.current) return
    const controller = new AbortController()
    requestRef.current = controller
    setAsked(question)
    setStatus('loading')
    setResult(null)
    if (window.matchMedia('(max-width: 720px)').matches) {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    try {
      const data = await askSubagentRag({ question, signal: controller.signal })
      if (controller.signal.aborted) return
      setResult(data)
      setStatus('done')
    } catch (err) {
      if (!controller.signal.aborted) {
        const retry = err.retryAfter ? ` Try again in ${err.retryAfter} seconds.` : ''
        const message = err.name === 'TimeoutError' ? 'The question timed out. Please try again.'
          : err.status ? err.message : 'Question answering is unavailable. Please try again.'
        setResult({ answer: message + retry })
        setStatus('error')
      }
    } finally {
      requestRef.current = null
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
  }

  return (
    <section className="rag-page">
      <div className="container rag-inner">
        <header className="rag-head">
          <p className="eyebrow">
            <span className="pulse" />
            Live · Supervisor + PDF subagent
          </p>
          <h1>
            <span className="gradient-text">Multimodal Subagent RAG</span>
          </h1>
          <p className="rag-sub">
            Ask about Avicenna’s Canon of Medicine. A LangChain supervisor delegates to a PDF subagent that
            retrieves text, tables and reviewed images, then synthesizes an answer with source and page citations.
          </p>
        </header>

        {/* Chat window */}
        <form className="rag-panel chat-window" onSubmit={submit}>
          <div className="panel-bar">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="panel-title">chat</span>
          </div>

          <label htmlFor="subagent-question" className="sr-only">
            Your question
          </label>
          <textarea
            id="subagent-question"
            className="chat-input"
            rows={4}
            placeholder="Ask a question about the reviewed book…"
            aria-describedby="subagent-question-limit"
            aria-invalid={length > 200}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <div className="chat-actions">
            <span className="question-limit" id="subagent-question-limit">{length}/200 characters</span>
            <span className="hint">Enter to send · Shift+Enter for new line</span>
            <button type="submit" className="btn-send" disabled={!question.trim() || length > 200 || status === 'loading'}>
              {status === 'loading' ? 'Thinking…' : 'Send'} <ArrowIcon />
            </button>
          </div>

          <div className="examples">
            {examples.map((ex) => (
              <button key={ex} type="button" className="example" onClick={() => setQuestion(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </form>

        {/* Response window */}
        <section ref={responseRef} className="rag-panel response-window" aria-live="polite">
          <div className="panel-bar">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="panel-title">response</span>
          </div>

          <div className="response-body">
            {status === 'idle' && (
              <div className="response-empty">
                <div className="orb" aria-hidden="true" />
                <p>Your grounded answer will appear here.</p>
              </div>
            )}

            {status !== 'idle' && (
              <p className="asked">
                <span className="mono">Q:</span> {asked}
              </p>
            )}

            {status === 'loading' && (
              <div className="thinking">
                <span />
                <span />
                <span />
                <p className="mono">retrieving book evidence · preparing a cited answer</p>
              </div>
            )}

            {(status === 'done' || status === 'error') && result && (
              <>
                <p className={`answer ${status === 'error' ? 'is-error' : ''}`}>{result.answer}</p>
                {status === 'done' && (
                  <div className="sources" aria-labelledby="subagent-sources-heading">
                    <h3 className="mono" id="subagent-sources-heading">Sources · {result.sources.length}</h3>
                    {!result.sources.length && <p>No sources were returned for this answer.</p>}
                    <ol>
                      {result.sources.map((source) => (
                        <li key={source.citation_id}>
                          <strong>{source.citation_id} · {source.source}</strong>
                          <span>Page{source.physical_pages.length === 1 ? '' : 's'} {source.physical_pages.join(', ')}</span>
                          {citationLinks(source).map(link => (
                            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="citation-link">
                              {link.label}
                            </a>
                          ))}
                          {citationLinks(source).filter(link => /\.(png|md)$/.test(new URL(link.url).pathname)).map(link => (
                            <SourcePreview key={link.url} link={link} source={source} />
                          ))}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
