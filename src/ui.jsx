import {useEffect,useState} from 'react'
import {LineChart,Line,ResponsiveContainer,AreaChart,Area,XAxis,YAxis,Tooltip} from 'recharts'
import {Star,AlertTriangle,X} from 'lucide-react'
import {money,pct} from './api.js'
import {useApp} from './store.jsx'
export const Logo=({size=34})=><svg width={size} height={size} viewBox="0 0 64 64" aria-hidden><defs><linearGradient id="lg" x1="0" x2="1"><stop stopColor="#3987FF"/><stop offset="1" stopColor="#FF405C"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="var(--bg2)"/><path d="M6 34h12l6-18 10 32 8-24 4 10h12" fill="none" stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>
export const Brand=()=><div className="brand"><Logo/><div><b>CryptoPulse</b><small>by arjuniverse</small></div></div>
export const Skel=({h=20,w='100%'})=><div className="skel" style={{height:h,width:w}}/>
export const Delta=({v})=><span className={v>=0?'up':'down'}>{pct(v)}</span>
export const Spark=({data,up})=><div style={{width:96,height:32}}><ResponsiveContainer><LineChart data={(data||[]).map(v=>({v}))}><Line dataKey="v" dot={false} stroke={up?'var(--green)':'var(--red)'} strokeWidth={1.6} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>
export const Err=({msg})=>msg?<div className="err"><AlertTriangle size={16}/>{msg}</div>:null
export function Count({value,render}){
  const [v,setV]=useState(0)
  useEffect(()=>{if(value==null)return;let r,t0;const f=t=>{t0??=t;const p=Math.min((t-t0)/700,1);setV(value*(1-Math.pow(1-p,3)));if(p<1)r=requestAnimationFrame(f)};r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)},[value])
  return value==null?<Skel h={30} w={120}/>:<>{render(v)}</>
}
export const Stat=({label,children})=><div className="card stat"><span className="mut">{label}</span><div className="big">{children}</div></div>
export const Modal=({title,onClose,children})=><div className="scrim" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()} role="dialog" aria-label={title}><div className="row"><h3>{title}</h3><button className="ghost" onClick={onClose} aria-label="Close"><X size={18}/></button></div>{children}</div></div>
export function Btn({loading,children,...p}){return <button {...p} disabled={loading||p.disabled}>{loading?'Working…':children}</button>}
export const StarBtn=({id,name})=>{const {watch,toggleWatch}=useApp();const on=watch.includes(id);return <button className={'ghost star'+(on?' on':'')} aria-label={on?'Remove from watchlist':'Add to watchlist'} onClick={e=>{e.preventDefault();e.stopPropagation();toggleWatch(id,name)}}><Star size={18} fill={on?'currentColor':'none'}/></button>}
const RANGES=[['24H',1],['7D',7],['1M',30],['3M',90],['1Y',365]]
export function PriceChart({data,loading,days,setDays,cur,up=true}){
  const pts=(data?.prices||[]).map(([t,p])=>({t,p}))
  const c=up?'var(--green)':'var(--red)'
  return <div><div className="seg">{RANGES.map(([l,d])=><button key={d} className={days===d?'on':''} onClick={()=>setDays(d)}>{l}</button>)}</div>
    <div style={{height:280}}>{loading&&!pts.length?<Skel h={280}/>:<ResponsiveContainer><AreaChart data={pts}><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".35"/><stop offset="1" stopColor={c} stopOpacity="0"/></linearGradient></defs>
      <XAxis dataKey="t" hide/><YAxis domain={['auto','auto']} hide/><Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--line)',borderRadius:12}} labelFormatter={t=>new Date(t).toLocaleString()} formatter={v=>[money(v,cur),'Price']}/>
      <Area dataKey="p" stroke={c} strokeWidth={2} fill="url(#ar)" animationDuration={900}/></AreaChart></ResponsiveContainer>}</div></div>
}
