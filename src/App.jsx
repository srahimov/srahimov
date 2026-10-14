import { useEffect, useState } from 'react'
import NeuralBackground from './components/NeuralBackground'
import {
  ArrowIcon,
  ChainIcon,
  GithubIcon,
  GraphIcon,
  LinkedinIcon,
  MailIcon,
  ScopeIcon,
} from './components/Icons'
import { experience, profile, projects, stack } from './data'
import MultimodalRag from './pages/MultimodalRag'

const stackIcons = { langchain: ChainIcon, langgraph: GraphIcon, langsmith: ScopeIcon }

const navLinks = [
  { href: '/#projects', label: 'Projects' },
  { href: '/multimodal-rag', label: 'Multimodal RAG' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#contact', label: 'Contact' },
]

function Header({ path }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">SR</span>
          <span className="logo-text">{profile.name}</span>
        </a>
        <button
          className={`menu-btn ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav ${open ? 'is-open' : ''}`}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={path === l.href ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <NeuralBackground />
      <div className="container hero-inner">
        <p className="eyebrow">
          <span className="pulse" /> {profile.role}
        </p>
        <h1 className="hero-title">
          Hi, I'm <span className="gradient-text">{profile.name}</span>
          <br />I build intelligent agents.
        </h1>
        <p className="hero-sub">{profile.tagline}</p>
        <a href="#projects" className="cta">
          My Projects <ArrowIcon className="cta-icon" />
        </a>

        <div className="stack-row">
          {stack.map((s) => {
            const Icon = stackIcons[s.key]
            return (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="stack-card">
                <span className="stack-icon">
                  <Icon />
                </span>
                <span className="stack-label">{s.label}</span>
                <span className="stack-name">{s.name}</span>
                <span className="stack-blurb">{s.blurb}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ index, title, kicker }) {
  return (
    <div className="section-title">
      <span className="section-index">{index}</span>
      <h2>{title}</h2>
      {kicker && <p>{kicker}</p>}
    </div>
  )
}

function Projects() {
  const filters = ['All', ...stack.map((s) => s.name)]
  const [active, setActive] = useState('All')
  const shown = active === 'All' ? projects : projects.filter((p) => p.tech.includes(active))

  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionTitle
          index="01"
          title="My Projects"
          kicker="Agentic and LLM systems built across the LangChain ecosystem."
        />
        <div className="filters" role="tablist">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={active === f}
              className={`filter ${active === f ? 'is-active' : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="project-grid">
          {shown.map((p) => (
            <article key={p.title} className="project-card">
              <div className="project-top">
                <div className="tags">
                  {p.tech.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                {p.link.startsWith('/') ? (
                  <a href={p.link} className="project-demo">
                    Try it <ArrowIcon />
                  </a>
                ) : (
                  <a href={p.link} target="_blank" rel="noreferrer" aria-label={`${p.title} on GitHub`} className="project-link">
                    <GithubIcon />
                  </a>
                )}
              </div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <ul>
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionTitle index="02" title="Work Experience" kicker="Where I've built and shipped." />
        <ol className="timeline">
          {experience.map((e) => (
            <li key={e.period + e.role} className="timeline-item">
              <span className="timeline-dot" />
              <div className="timeline-card">
                <span className="period">{e.period}</span>
                <h3>
                  {e.role} <span className="at">@ {e.company}</span>
                </h3>
                <ul>
                  {e.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="contact-card">
          <SectionTitle index="03" title="Let's build something" kicker="Open to AI engineering roles, collaborations and consulting." />
          <div className="contact-links">
            <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost">
              <GithubIcon /> GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
              <LinkedinIcon /> LinkedIn
            </a>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="btn-ghost">
                <MailIcon /> Email
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <Experience />
      <Contact />
    </>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  return (
    <>
      <div className="grid-overlay" aria-hidden="true" />
      <Header path={path} />
      <main>{path === '/multimodal-rag' ? <MultimodalRag /> : <Home />}</main>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} {profile.name} · <span className="mono">built with React</span>
        </div>
      </footer>
    </>
  )
}
