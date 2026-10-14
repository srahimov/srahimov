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
