import assert from 'node:assert/strict'
import { test } from 'node:test'
import { askRag, citationLinks } from '../src/lib/rag.js'

const source = { citation_id: 'S1', source: 'Canon-of-Medicine.pdf', physical_pages: [4] }

test('existing chat sends only JSON question and preserves real API citation fields', async t => {
  const calls=[]
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({url,options}); return Response.json({answer:'Two purposes. [S1]',sources:[source]}) })
  assert.deepEqual(await askRag({question:'A question?'}),{answer:'Two purposes. [S1]',sources:[source]})
  assert.equal(calls.length,1)
  assert.equal(calls[0].url,'https://qozon-api.qozontech.workers.dev/questions')
  assert.equal(calls[0].options.credentials,'omit')
  assert.deepEqual(calls[0].options.headers,{'Content-Type':'application/json'})
  assert.deepEqual(JSON.parse(calls[0].options.body),{question:'A question?'})
})

test('Unicode limit rejects invalid questions before sending', async t => {
  let calls=0
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({answer:'Checked.'})})
  await askRag({question:'😀'.repeat(200)})
  for(const question of ['😀'.repeat(201),'   ',123]) await assert.rejects(askRag({question}),/1–200/)
  assert.equal(calls,1)
})

test('429 exposes wait and is never retried',async t=>{
  let calls=0
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({detail:{code:'question_rate_limited',message:'Please wait.'}},{status:429,headers:{'Retry-After':'25'}})})
  await assert.rejects(askRag({question:'Question?'}),e=>e.status===429&&e.retryAfter===25)
  assert.equal(calls,1)
})

test('non-JSON error never displays upstream contents or retries',async t=>{
  let calls=0
  t.mock.method(globalThis,'fetch',async()=>{calls++;return new Response('private upstream content',{status:503})})
  await assert.rejects(askRag({question:'Question?'}),e=>e.message==='Question answering is unavailable.')
  assert.equal(calls,1)
})

test('malformed successful source cannot break citation rendering',async t=>{
  t.mock.method(globalThis,'fetch',async()=>Response.json({answer:'Text.',sources:[{title:'Old demo shape'}]}))
  await assert.rejects(askRag({question:'Question?'}),/invalid source citations/)
})

test('only approved file types get links; bare text keeps its page citation',()=>{
  assert.deepEqual(citationLinks(source),[])
  const links=citationLinks({...source,url:'https://assets.example/reviewed.png',image_url:'https://assets.example/reviewed.png',structured_url:'https://assets.example/reviewed.json'})
  assert.equal(links.length,2)
  for(const url of ['https://assets.example/original.pdf','javascript:alert(1)','http://assets.example/file.png']) assert.deepEqual(citationLinks({...source,url}),[])
})

test('unmount cancellation reaches fetch with no automatic retry',async t=>{
  const controller=new AbortController();controller.abort()
  let calls=0
  t.mock.method(globalThis,'fetch',async(_url,options)=>{calls++;assert(options.signal.aborted);throw options.signal.reason})
  await assert.rejects(askRag({question:'Question?',signal:controller.signal}),{name:'AbortError'})
  assert.equal(calls,1)
})
