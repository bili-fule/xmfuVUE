import test from 'node:test'
import assert from 'node:assert/strict'
import onRequest from '../edge-functions/api/ledger/[[path]].js'
test('website ledger proxy has a fixed HTTPS origin and forwards only its own auth cookie',async()=>{
 const old=globalThis.fetch,calls=[]
 globalThis.fetch=async(url,init)=>{calls.push({url,init});return new Response('{"published":true}',{headers:{'set-cookie':'ledger_session='+ 'a'.repeat(64)+'; HttpOnly; Secure; SameSite=Strict; Path=/api/ledger/'}})}
 try{
  const result=await onRequest({request:new Request('https://www.xmfu.cn/api/ledger/details?month=2026-10',{headers:{authorization:'Bearer NEVER_FORWARD',cookie:'site_auth=SECRET; ledger_session='+ 'b'.repeat(64)}})})
  assert.equal(result.status,200);assert.equal(result.headers.get('cache-control'),'no-store, private');assert.match(result.headers.get('set-cookie'),/HttpOnly/)
  assert.equal(calls[0].url,'https://120.79.152.252/api/ledger/details?month=2026-10');assert.equal(calls[0].init.headers.get('authorization'),null);assert.equal(calls[0].init.headers.get('cookie'),'ledger_session='+ 'b'.repeat(64))
  assert.equal((await onRequest({request:new Request('https://www.xmfu.cn/api/ledger/settings')})).status,404)
  assert.equal((await onRequest({request:new Request('https://www.xmfu.cn/api/ledger/logout',{method:'POST',headers:{origin:'https://attacker.test','content-type':'application/json'},body:'{}'})})).status,403)
  assert.equal(calls.length,1)
 }finally{globalThis.fetch=old}
})


test('website proxy works in EdgeOne without AbortSignal.timeout',async()=>{
 const old=globalThis.fetch,descriptor=Object.getOwnPropertyDescriptor(AbortSignal,'timeout')
 globalThis.fetch=async()=>new Response('{"published":true}')
 Object.defineProperty(AbortSignal,'timeout',{value:undefined,configurable:true})
 try{const response=await onRequest({request:new Request('https://www.xmfu.cn/api/ledger/public')});assert.equal(response.status,200)}finally{globalThis.fetch=old;Object.defineProperty(AbortSignal,'timeout',descriptor)}
})
