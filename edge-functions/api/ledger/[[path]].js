// Public website gateway. Only the separate, restricted ledger HTTPS origin.
const ORIGIN='https://120.79.152.252'
const paths=new Set(['GET /api/ledger/public','GET /api/ledger/session','GET /api/ledger/details','POST /api/ledger/login','POST /api/ledger/logout'])
export default async function onRequest({request}){
 const url=new URL(request.url),key=request.method+' '+url.pathname
 const response=(status,error)=>new Response(JSON.stringify({error}),{status,headers:{'content-type':'application/json','cache-control':'no-store'}})
 if(!paths.has(key))return response(404,'没有这个接口')
 if(request.method==='POST'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return response(403,'请求来源不匹配')
 const headers=new Headers({'content-type':'application/json'})
 const cookie=(request.headers.get('cookie')??'').match(/(?:^|;\s*)ledger_session=([a-f0-9]{64})(?:;|$)/)?.[1]
 if(cookie)headers.set('cookie','ledger_session='+cookie)
 // Nothing from the browser can select a different origin or forward admin auth.
 try{
  let body
  if(request.method==='POST'){if(!(request.headers.get('content-type')??'').startsWith('application/json'))return response(415,'需要 JSON 请求');body=await request.arrayBuffer();if(body.byteLength>4096)return response(413,'请求过长')}
  const result=await fetch(ORIGIN+url.pathname+url.search,{method:request.method,headers,body,redirect:'error'})
  const outgoing=new Headers({'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','referrer-policy':'no-referrer'})
  const cookieHeader=result.headers.get('set-cookie');if(cookieHeader)outgoing.set('set-cookie',cookieHeader)
  return new Response(result.body,{status:result.status,headers:outgoing})
 }catch(error){return new Response(JSON.stringify({error:'账本暂时无法连接，请稍后再试',diagnostic:String(error?.message??error).slice(0,240)}),{status:502,headers:{'content-type':'application/json','cache-control':'no-store'}})}
}
