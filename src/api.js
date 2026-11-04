import {useEffect,useState} from 'react'
const BASE='https://api.coingecko.com/api/v3'
const mem=new Map()
// Centralized CoinGecko client: in-memory + localStorage cache, 429 handling, stale fallback.
export async function get(path,ttl=60000){
  const hit=mem.get(path)
  if(hit&&Date.now()-hit.t<ttl)return hit.d
  let saved;try{saved=JSON.parse(localStorage.getItem('cp.c.'+path))}catch{}
  try{
    const r=await fetch(BASE+path)
    if(r.status===429)throw new Error('Rate limit reached. Retrying automatically.')
    if(!r.ok)throw new Error('Market data service returned '+r.status+'.')
    const d=await r.json();mem.set(path,{d,t:Date.now()})
    try{localStorage.setItem('cp.c.'+path,JSON.stringify({d}))}catch{}
    return d
  }catch(e){
    const err=new Error(e.message==='Failed to fetch'?'Cannot reach the market data service. Check your connection.':e.message)
    err.stale=hit?.d??saved?.d;throw err
  }
}
export function useApi(path,{every=0,ttl=60000}={}){
  const [st,set]=useState({data:null,error:null,loading:!!path})
  useEffect(()=>{
    if(!path)return;let live=true
    set(p=>({...p,loading:true}))
    const run=()=>get(path,ttl).then(d=>live&&set({data:d,error:null,loading:false})).catch(e=>live&&set(p=>({data:e.stale??p.data,error:e.message,loading:false,stale:!!e.stale})))
    run();const i=every?setInterval(run,every*1000):0
    return()=>{live=false;clearInterval(i)}
  },[path,every,ttl])
  return st
}
export const marketsPath=(cur,extra='')=>`/coins/markets?vs_currency=${cur}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d${extra}`
export const money=(n,cur='usd',compact=false)=>n==null?'—':new Intl.NumberFormat(cur==='inr'?'en-IN':'en-US',{style:'currency',currency:cur.toUpperCase(),notation:compact?'compact':'standard',maximumFractionDigits:compact?2:n<1?6:2}).format(n)
export const pct=n=>n==null?'—':(n>0?'+':'')+n.toFixed(2)+'%'
