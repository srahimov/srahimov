import { useEffect, useRef, useState } from 'react'
import { ArrowIcon } from '../components/Icons'
import { askSubagentRag, isConnected, subagents } from '../lib/subagentRag'

const examples = [
  'Compare what the text and the illustrations say about the same topic.',
  'Which table lists the values mentioned in chapter two?',
  'Summarize the document and point to the supporting figures.',
]

export default function MultimodalSubagentRag() {
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [asked, setAsked] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const requestRef = useRef(null)
  const responseRef = useRef(null)
  const length = [...question].length

  useEffect(() => {
    document.title = 'Multimodal Subagent RAG · S. Rahimov'
    return () => requestRef.current?.abort()
  }, [])

  // Walk through the subagent pipeline while a request is running.
  useEffect(() => {
    if (status !== 'loading') return
    setActiveStep(0)
    const id = setInterval(() => setActiveStep((s) => Math.min(s + 1, subagents.length - 1)), 700)
    return () => clearInterval(id)
  }, [status])

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
        const message =
          err.name === 'TimeoutError'
            ? 'The question timed out. Please try again.'
            : err.message || 'Question answering is unavailable. Please try again.'
        setResult({ answer: message })
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
            <span className={`pulse ${isConnected ? '' : 'is-off'}`} />
            {isConnected ? 'Live · LangChain subagents' : 'Demo · backend coming soon'}
          </p>
          <h1>
            <span className="gradient-text">Multimodal Subagent RAG</span>
          </h1>
          <p className="rag-sub">
            A supervisor agent built with LangChain splits each question across specialist subagents for text, images
            and tables, then synthesizes their findings into one grounded answer.
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
            placeholder="Ask a question for the subagents…"
            aria-describedby="subagent-question-limit"
            aria-invalid={length > 200}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <div className="chat-actions">
            <span className="question-limit" id="subagent-question-limit">
              {length}/200 characters
            </span>
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
                <p>The subagents' combined answer will appear here.</p>
              </div>
            )}

            {status !== 'idle' && (
              <p className="asked">
                <span className="mono">Q:</span> {asked}
              </p>
            )}

            {status === 'loading' && (
              <ol className="agent-steps">
                {subagents.map((s, i) => (
                  <li key={s.agent} className={i < activeStep ? 'is-done' : i === activeStep ? 'is-active' : ''}>
                    <span className="agent-name mono">{s.agent}</span>
                    <span className="agent-summary">{s.summary}</span>
                  </li>
                ))}
              </ol>
            )}

            {(status === 'done' || status === 'error') && result && (
              <>
                <p className={`answer ${status === 'error' ? 'is-error' : ''}`}>{result.answer}</p>
                {result.steps?.length > 0 && (
                  <div className="sources">
                    <h3 className="mono">Subagent trace</h3>
                    <ol className="agent-steps">
                      {result.steps.map((s, i) => (
                        <li key={i} className="is-done">
                          <span className="agent-name mono">{s.agent}</span>
                          {s.summary && <span className="agent-summary">{s.summary}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {result.sources?.length > 0 && (
                  <div className="sources">
                    <h3 className="mono">Sources</h3>
                    <ol>
                      {result.sources.map((s, i) => (
                        <li key={i}>
                          {s.url?.startsWith('https:') ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer">
                              {s.title || s.url}
                            </a>
                          ) : (
                            s.title
                          )}
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
