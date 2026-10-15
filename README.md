# S. Rahimov — Portfolio

Personal site for work experience and projects, built with React + Vite. Purple, AI-inspired theme with an animated neural-network hero, fully responsive for mobile.

## Run locally

```bash
npm install
npm run dev
```

## Edit content

All text lives in [`src/data.js`](src/data.js): profile, the LangChain / LangGraph / LangSmith row, projects, and work experience.

## Build

```bash
npm run build   # outputs to dist/
```

## Deploy

Hosted on Cloudflare Pages at [srahimov.site](https://srahimov.site). Every push to `main` builds and deploys automatically; other branches get preview URLs.

## Multimodal RAG chat

The existing `/multimodal-rag` page sends one public JSON question to
`https://qozon-api.qozontech.workers.dev/questions`, with no browser key or login.
The API searches the reviewed Canon of Medicine text, tables and images. User
attachments are not supported; the original PDF stays private. Sources display
citation IDs, filenames and physical pages, with approved image/table/text links
when supplied. Questions are limited to 200 Unicode characters, with a 60-second
client deadline and no automatic retry; 429 responses show the retry wait.

`VITE_RAG_API_URL` optionally overrides the API **base URL** at build time. The
production URL above is the default. Do not put any backend key in Vite variables.

```bash
node --test tests/rag.test.mjs
npm run build
```

## Multimodal Subagent RAG chat

`/multimodal-subagent-rag` connects to the separate
`https://qozon-multi-agent-api.qozontech.workers.dev/questions` endpoint. One
LangChain supervisor delegates to one PDF subagent for Avicenna's Canon of
Medicine. The specialist retrieves evidence and synthesizes a cited answer;
the supervisor's privacy middleware handles visitor input and the returned answer.

`src/lib/subagentRag.js` selects this API, reusing the public request, response,
citation validation and error handling in `src/lib/rag.js`.
`src/pages/MultimodalSubagentRag.jsx` displays answer text, source IDs, filenames,
physical pages and approved source links. Loading is a waiting indicator, not a
simulated execution trace. Demo replies and fictional specialist steps are removed.

`VITE_SUBAGENT_RAG_API_URL` optionally overrides this page's API base URL at build
time. No browser API key is needed. The existing `/multimodal-rag` page keeps its
original API and its independent `VITE_RAG_API_URL` override. Both pages use a
200-character question limit, a 60-second client deadline and no automatic retry.

Sources on the subagent page appear automatically below each answer. Approved
source images and table images are embedded inline, and approved Markdown table
excerpts load as plain text without opening another tab. Source links remain
available if a preview cannot load. Text-only citations display their filename and
physical page reference; the API does not return an excerpt for those citations.
A completed response with no citations explicitly says no sources were returned.
No additional model calls are made to display source previews.
