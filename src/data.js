// Edit this file to update the site content.

export const profile = {
  name: 'S. Rahimov',
  role: 'AI Engineer · Agentic Systems',
  tagline:
    'I design and ship LLM-powered applications — from retrieval pipelines to multi-agent workflows — with the tooling to observe, evaluate and trust them in production.',
  github: 'https://github.com/srahimov',
  linkedin: 'https://www.linkedin.com/',
  email: '', // add a public contact email to show a mail button
}

// Second row on the home page.
export const stack = [
  {
    key: 'langchain',
    name: 'LangChain',
    label: 'Build',
    blurb: 'Composable chains, tools and retrieval (RAG) that connect LLMs to real data and APIs.',
    url: 'https://www.langchain.com/langchain',
  },
  {
    key: 'langgraph',
    name: 'LangGraph',
    label: 'Orchestrate',
    blurb: 'Stateful, multi-agent graphs with cycles, memory and human-in-the-loop control.',
    url: 'https://www.langchain.com/langgraph',
  },
  {
    key: 'langsmith',
    name: 'LangSmith',
    label: 'Observe',
    blurb: 'Tracing, datasets and evaluations to debug, measure and improve every run.',
    url: 'https://www.langchain.com/langsmith',
  },
]

export const projects = [
  {
    title: 'Knowledge Base RAG Assistant',
    tech: ['LangChain', 'LangSmith'],
    description:
      'Retrieval-augmented chatbot over internal documents with hybrid search, source citations and automatic evaluation of answer faithfulness.',
    highlights: ['Hybrid vector + keyword retrieval', 'Cited answers', 'Eval datasets in LangSmith'],
    link: 'https://github.com/srahimov',
  },
  {
    title: 'Multi-Agent Research Workflow',
    tech: ['LangGraph', 'LangChain'],
    description:
      'A supervisor agent that plans, delegates to researcher and writer agents, and loops until the report passes a quality check.',
    highlights: ['Supervisor / worker graph', 'Persistent memory', 'Human-in-the-loop approval'],
    link: 'https://github.com/srahimov',
  },
  {
    title: 'LLM Observability & Evals Pipeline',
    tech: ['LangSmith', 'LangGraph'],
    description:
      'End-to-end tracing and regression testing for agent runs: prompt versioning, LLM-as-judge scoring and cost / latency dashboards.',
    highlights: ['Trace every step', 'Regression test suites', 'Cost & latency monitoring'],
    link: 'https://github.com/srahimov',
  },
  {
    title: 'Tool-Calling Customer Support Agent',
    tech: ['LangGraph', 'LangSmith'],
    description:
      'Agent that reads orders, issues refunds through guarded tools and escalates to a human when confidence is low.',
    highlights: ['Typed tool schemas', 'Guardrails & escalation', 'Online feedback loop'],
    link: 'https://github.com/srahimov',
  },
]

export const experience = [
  {
    period: '2024 — Present',
    role: 'AI Engineer',
    company: 'Company Name',
    points: [
      'Built production LLM agents with LangGraph serving thousands of requests per day.',
      'Introduced LangSmith tracing and evals, cutting regression bugs before release.',
      'Designed RAG pipelines over company knowledge with measurable accuracy gains.',
    ],
  },
  {
    period: '2022 — 2024',
    role: 'Software Engineer',
    company: 'Company Name',
    points: [
      'Developed full-stack web and mobile apps with React and React Native.',
      'Integrated third-party APIs and automated data workflows.',
    ],
  },
  {
    period: '2020 — 2022',
    role: 'Developer',
    company: 'Company Name',
    points: ['Shipped features across the stack and maintained CI/CD pipelines.'],
  },
]
