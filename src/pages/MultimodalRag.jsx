import { useEffect, useRef, useState } from 'react'
import { ArrowIcon } from '../components/Icons'
import { askRag, isConnected } from '../lib/rag'

const examples = [
  'Summarize the key findings in the attached PDF.',
  'What does this chart show, and what trend stands out?',
  'Compare the two product images and list the differences.',
]

const ACCEPT = 'image/*,application/pdf,.txt,.md,.docx'

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export default function MultimodalRag() {
  const [question, setQuestion] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [asked, setAsked] = useState('')
  const fileRef = useRef(null)
  const responseRef = useRef(null)

  useEffect(() => {
    document.title = 'Multimodal RAG · S. Rahimov'
  }, [])

  const addFiles = (list) => {
    const next = Array.from(list || [])
    setFiles((prev) => [...prev, ...next].slice(0, 5))
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const submit = async (e) => {
    e?.preventDefault()
    const q = question.trim()
    if (!q || status === 'loading') return
    setAsked(q)
    setStatus('loading')
    setResult(null)
    if (window.matchMedia('(max-width: 720px)').matches) {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    try {
      const data = await askRag({ question: q, files })
      setResult(data)
      setStatus('done')
    } catch (err) {
      setResult({ answer: err.message })
      setStatus('error')
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e)
  }

  return (
    <section className="rag-page">
      <div className="container rag-inner">
        <header className="rag-head">
          <p className="eyebrow">
            <span className={`pulse ${isConnected ? '' : 'is-off'}`} />
            {isConnected ? 'Live · LangChain pipeline' : 'Demo · backend coming soon'}
          </p>
          <h1>
            <span className="gradient-text">Multimodal RAG</span>
          </h1>
          <p className="rag-sub">
            Ask a question and attach images or documents. The LangChain pipeline retrieves the most relevant text and
            visual context, then generates an answer grounded in those sources.
          </p>
        </header>

        {/* Chat window */}
        <form
          className="rag-panel chat-window"
          onSubmit={submit}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            addFiles(e.dataTransfer.files)
          }}
        >
          <div className="panel-bar">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="panel-title">chat</span>
          </div>

          <label htmlFor="rag-question" className="sr-only">
            Your question
          </label>
          <textarea
            id="rag-question"
            className="chat-input"
            rows={4}
            placeholder="Ask anything about your documents or images…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
          />

          {files.length > 0 && (
            <ul className="file-chips">
              {files.map((f, i) => (
                <li key={f.name + i} className="file-chip">
                  <span className="file-kind">{f.type.startsWith('image/') ? 'IMG' : f.name.split('.').pop().toUpperCase()}</span>
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{formatSize(f.size)}</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => removeFile(i)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="chat-actions">
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button type="button" className="btn-attach" onClick={() => fileRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5" />
              </svg>
              Attach
            </button>
            <span className="hint">Enter to send · Shift+Enter for new line</span>
            <button type="submit" className="btn-send" disabled={!question.trim() || status === 'loading'}>
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
                <p className="mono">retrieving context · generating answer</p>
              </div>
            )}

            {(status === 'done' || status === 'error') && result && (
              <>
                <p className={`answer ${status === 'error' ? 'is-error' : ''}`}>{result.answer}</p>
                {result.sources?.length > 0 && (
                  <div className="sources">
                    <h3 className="mono">Sources</h3>
                    <ol>
                      {result.sources.map((s, i) => (
                        <li key={i}>
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noreferrer">
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                          {s.snippet && <span>{s.snippet}</span>}
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
