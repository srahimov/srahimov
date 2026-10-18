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
    title: 'Multimodal RAG',
    tech: ['LangChain', 'LangSmith'],
    description:
      'A LangChain-based retrieval system that answers questions over text, images and PDFs, grounding every response in retrieved sources.',
    highlights: ['Text + image + PDF retrieval', 'Grounded, cited answers', 'Live demo on this site'],
    link: '/multimodal-rag',
  },
  {
    title: 'Multimodal Subagent RAG',
    tech: ['LangChain', 'LangGraph'],
    description:
      'A supervisor agent delegates each question to specialist subagents for text, images and tables, then synthesizes one grounded answer.',
    highlights: ['Supervisor / subagent routing', 'Text, vision and table specialists', 'Live demo on this site'],
    link: '/multimodal-subagent-rag',
  },
  {
    title: 'Document Knowledge RAG Assistant',
    tech: ['LangChain', 'LangGraph'],
    description:
      'A Python agentic RAG assistant for Skyview Hotel that searches five current PDFs, cites source documents and supports follow-up questions with conversation memory.',
    highlights: ['Five-document knowledge base', 'Source-cited answers', 'Saved vector index + chat memory'],
    link: 'https://github.com/srahimov/document-knowledge-assistant',
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
    tech: ['LangChain', 'LangGraph', 'Supabase'],
    description:
      'Python support copilot for Fox Insurance Service with department routing, permission-checked tools and persistent human approval for ticket updates.',
    highlights: ['Typed tools & structured output', 'Approve, edit or reject updates', 'Postgres conversation memory'],
    link: 'https://github.com/srahimov/customer-support-pilot',
  },
]

// Work Experience graph: skills orbiting the center node.
export const skills = [
  'Agentic RAG',
  'Agentic AI',
  'Tool Calling',
  'Python',
  'Hallucination Detection',
  'Structured Output',
  'Prompt Engineering',
  'Salesforce',
  'Go HighLevel',
  'Canva',
  'Playwright',
  'GitHub',
  'Postgres',
  'Authentication',
  'Authorization',
  'Agentic Workflows',
]
