import {createContext,useContext,useState,useEffect,useCallback} from 'react'
const Ctx=createContext()
export const useApp=()=>useContext(Ctx)
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem('cp.'+k))??d}catch{return d}}
const KEYS={theme:'dark',currency:'usd',refresh:60,watch:[],holdings:[],recent:[]}
export function AppProvider({children}){
  const [s,set]=useState(()=>Object.fromEntries(Object.entries(KEYS).map(([k,d])=>[k,ls(k,d)])))
  const [toasts,setT]=useState([])
  useEffect(()=>{document.documentElement.dataset.theme=s.theme;for(const k in s)localStorage.setItem('cp.'+k,JSON.stringify(s[k]))},[s])
  const up=(k,v)=>set(p=>({...p,[k]:typeof v==='function'?v(p[k]):v}))
  const toast=useCallback(msg=>{const id=Math.random();setT(t=>[...t,{id,msg}]);setTimeout(()=>setT(t=>t.filter(x=>x.id!==id)),2800)},[])
  const toggleWatch=(id,name)=>{const has=s.watch.includes(id);up('watch',w=>has?w.filter(x=>x!==id):[...w,id]);toast(has?`${name} removed from watchlist`:`${name} added to watchlist`)}
  const seen=id=>up('recent',r=>[id,...r.filter(x=>x!==id)].slice(0,6))
  return <Ctx.Provider value={{...s,up,toast,toggleWatch,seen}}>{children}{<div className="toasts">{toasts.map(t=><div key={t.id} className="toast">{t.msg}</div>)}</div>}</Ctx.Provider>
}
