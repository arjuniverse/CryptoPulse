import {useState,useEffect,useMemo} from 'react'
import {Link,useParams} from 'react-router-dom'
import {PieChart,Pie,Cell,ResponsiveContainer,Tooltip} from 'recharts'
import {Search,Plus,Trash2,Sun,Moon,ArrowLeft,Flame} from 'lucide-react'
import {useApi,marketsPath,money,pct} from './api.js'
import {useApp} from './store.jsx'
import {Stat,Count,Skel,Delta,Spark,Err,StarBtn,Modal,Btn,PriceChart} from './ui.jsx'

const Head=({t,s})=><div className="head"><h1>{t}</h1>{s&&<p className="mut">{s}</p>}</div>
const Empty=({title,text,to,cta})=><div className="card empty"><svg width="120" height="64" viewBox="0 0 120 64" aria-hidden><path d="M4 36h22l10-26 16 46 14-34 8 14h42" fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".6"/></svg><h3>{title}</h3><p className="mut">{text}</p>{to&&<Link className="btn" to={to}>{cta}</Link>}</div>
const Rows=({coins,cur,loading})=>loading&&!coins.length?<>{[...Array(6)].map((_,i)=><Skel key={i} h={44}/>)}</>:coins.map(c=><Link key={c.id} to={`/coin/${c.id}`} className="mini"><img src={c.image} alt="" width="28" height="28"/><span><b>{c.name}</b><small className="mut">{c.symbol?.toUpperCase()}</small></span><span className="r">{money(c.current_price,cur)}<Delta v={c.price_change_percentage_24h}/></span></Link>)
const useMarkets=(extra='&per_page=100&page=1')=>{const {currency:cur,refresh}=useApp();return {cur,...useApi(marketsPath(cur,extra),{every:refresh})}}

export function Dashboard(){
  const {refresh,watch,recent}=useApp()
  const [days,setDays]=useState(7)
  const m=useMarkets(),cur=m.cur,coins=m.data||[]
  const g=useApi('/global',{every:refresh}),G=g.data?.data
  const tr=useApi('/search/trending',{ttl:300000})
  const ch=useApi(`/coins/bitcoin/market_chart?vs_currency=${cur}&days=${days}`,{ttl:120000})
  const s=[...coins].sort((a,b)=>b.price_change_percentage_24h-a.price_change_percentage_24h)
  const byId=id=>coins.find(c=>c.id===id)
  const err=m.error||g.error
  return <><Head t="Market overview" s="Live data across the crypto market."/><Err msg={err}/>
    <div className="grid4">
      <Stat label="Market cap"><Count value={G?.total_market_cap?.[cur]} render={v=>money(v,cur,true)}/></Stat>
      <Stat label="24h change"><Count value={G?.market_cap_change_percentage_24h_usd} render={v=><Delta v={v}/>}/></Stat>
      <Stat label="BTC dominance"><Count value={G?.market_cap_percentage?.btc} render={v=>v.toFixed(1)+'%'}/></Stat>
      <Stat label="24h volume"><Count value={G?.total_volume?.[cur]} render={v=>money(v,cur,true)}/></Stat></div>
    <div className="card"><div className="row"><h3>Bitcoin performance</h3><span className="mut">Price of BTC as a market benchmark</span></div>
      <PriceChart data={ch.data} loading={ch.loading} days={days} setDays={setDays} cur={cur} up={(ch.data?.prices?.at(-1)?.[1]??0)>=(ch.data?.prices?.[0]?.[1]??0)}/></div>
    <div className="grid2">
      <div className="card"><h3><Flame size={16}/> Trending</h3>{tr.loading&&!tr.data?<Skel h={120}/>:(tr.data?.coins||[]).slice(0,6).map(({item:i})=><Link key={i.id} to={`/coin/${i.id}`} className="mini"><img src={i.thumb} alt="" width="28" height="28"/><span><b>{i.name}</b><small className="mut">{i.symbol}</small></span><span className="r mut">#{i.market_cap_rank??'—'}</span></Link>)}{tr.error&&<p className="mut">Trending is unavailable right now.</p>}</div>
      <div className="card"><h3>Watchlist</h3>{watch.length?<Rows coins={watch.slice(0,5).map(byId).filter(Boolean)} cur={cur}/>:<p className="mut">Star a coin to track it here.</p>}</div>
      <div className="card"><h3>Top gainers</h3><Rows coins={s.slice(0,5)} cur={cur} loading={m.loading}/></div>
      <div className="card"><h3>Top losers</h3><Rows coins={s.slice(-5).reverse()} cur={cur} loading={m.loading}/></div></div>
    <div className="card"><h3>Recently viewed</h3>{recent.length?<Rows coins={recent.map(byId).filter(Boolean)} cur={cur}/>:<p className="mut">Coins you open will appear here.</p>}</div></>
}

const CATS=[['','All'],['layer-1','Layer 1'],['decentralized-finance-defi','DeFi'],['meme-token','Meme'],['stablecoins','Stablecoins'],['artificial-intelligence','AI']]
const SORTS={market_cap:'Market cap',current_price:'Price',price_change_percentage_24h:'24h change'}
export function CoinTable({coins,cur,loading}){
  return <div className="card tbl"><table><thead><tr><th>#</th><th>Coin</th><th className="r">Price</th><th className="r">24h</th><th className="r hm">7d</th><th className="r hm">Market cap</th><th className="hm">Last 7 days</th><th/></tr></thead><tbody>
    {loading&&!coins.length?[...Array(8)].map((_,i)=><tr key={i}><td colSpan="8"><Skel h={36}/></td></tr>):coins.map(c=><tr key={c.id}><td className="mut">{c.market_cap_rank}</td><td><Link to={`/coin/${c.id}`} className="nm"><img src={c.image} alt="" width="26" height="26"/><b>{c.name}</b><small className="mut">{c.symbol.toUpperCase()}</small></Link></td><td className="r">{money(c.current_price,cur)}</td><td className="r"><Delta v={c.price_change_percentage_24h}/></td><td className="r hm"><Delta v={c.price_change_percentage_7d_in_currency}/></td><td className="r hm">{money(c.market_cap,cur,true)}</td><td className="hm"><Spark data={c.sparkline_in_7d?.price} up={(c.price_change_percentage_7d_in_currency??0)>=0}/></td><td><StarBtn id={c.id} name={c.name}/></td></tr>)}</tbody></table></div>
}
export function Explore(){
  const [q,setQ]=useState(''),[sort,setSort]=useState('market_cap'),[cat,setCat]=useState(''),[page,setPage]=useState(1)
  const m=useMarkets(`&per_page=50&page=${page}${cat?'&category='+cat:''}`)
  const list=useMemo(()=>{const t=q.trim().toLowerCase();let l=(m.data||[]).filter(c=>!t||c.name.toLowerCase().includes(t)||c.symbol.toLowerCase().includes(t));return sort==='market_cap'?l:[...l].sort((a,b)=>(b[sort]??-1e12)-(a[sort]??-1e12))},[m.data,q,sort])
  return <><Head t="Explore markets" s="Search, sort and filter every listed coin."/><Err msg={m.error}/>
    <div className="bar"><label className="search"><Search size={16}/><input placeholder="Search by name or symbol" value={q} onChange={e=>setQ(e.target.value)}/></label>
      <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort by">{Object.entries(SORTS).map(([k,v])=><option key={k} value={k}>Sort: {v}</option>)}</select></div>
    <div className="seg wrap">{CATS.map(([k,l])=><button key={k} className={cat===k?'on':''} onClick={()=>{setCat(k);setPage(1)}}>{l}</button>)}</div>
    {!m.loading&&!list.length?<Empty title="No coins match" text="Try a different name, symbol or category."/>:<CoinTable coins={list} cur={m.cur} loading={m.loading}/>}
    <div className="pager"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="mut">Page {page}</span><button onClick={()=>setPage(p=>p+1)}>Next</button></div></>
}

const Fact=({l,v})=><div className="card stat"><span className="mut">{l}</span><div className="mid">{v}</div></div>
export function Coin(){
  const {id}=useParams(),{currency:cur,refresh,seen}=useApp(),[days,setDays]=useState(7)
  const d=useApi(`/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,{every:refresh})
  const ch=useApi(`/coins/${id}/market_chart?vs_currency=${cur}&days=${days}`,{ttl:120000})
  useEffect(()=>{seen(id)},[id]);useEffect(()=>{if(d.data)document.title=`${d.data.name} · CryptoPulse`;return()=>{document.title='CryptoPulse by arjuniverse'}},[d.data])
  const c=d.data,M=c?.market_data
  if(d.loading&&!c)return <><Skel h={60}/><Skel h={300}/></>
  if(!c)return <><Err msg={d.error||'Coin not found.'}/><Link to="/explore" className="btn">Back to Explore</Link></>
  return <><Link to="/explore" className="mut back"><ArrowLeft size={14}/> Explore</Link><Err msg={d.error}/>
    <div className="row"><div className="nm"><img src={c.image.large} alt="" width="48" height="48"/><div><h1>{c.name}</h1><span className="mut">{c.symbol.toUpperCase()} · Rank #{c.market_cap_rank??'—'}</span></div></div><StarBtn id={id} name={c.name}/></div>
    <div className="price">{money(M.current_price[cur],cur)} <Delta v={M.price_change_percentage_24h}/></div>
    <div className="chips">{[['7d',M.price_change_percentage_7d],['30d',M.price_change_percentage_30d],['1y',M.price_change_percentage_1y]].map(([l,v])=><span key={l} className="chip">{l} <Delta v={v}/></span>)}</div>
    <div className="card"><PriceChart data={ch.data} loading={ch.loading} days={days} setDays={setDays} cur={cur} up={(M.price_change_percentage_24h??0)>=0}/></div>
    <div className="grid4"><Fact l="Market cap" v={money(M.market_cap[cur],cur,true)}/><Fact l="24h volume" v={money(M.total_volume[cur],cur,true)}/><Fact l="Circulating supply" v={M.circulating_supply?Intl.NumberFormat('en',{notation:'compact'}).format(M.circulating_supply):'—'}/><Fact l="All-time high" v={money(M.ath[cur],cur)}/><Fact l="All-time low" v={money(M.atl[cur],cur)}/></div></>
}

export function Watchlist(){
  const {watch}=useApp(),m=useApi(watch.length?marketsPath(useApp().currency,`&ids=${watch.join(',')}`):null,{every:useApp().refresh}),cur=useApp().currency
  return <><Head t="Watchlist" s="Your favourite coins, saved on this device."/><Err msg={m.error}/>
    {!watch.length?<Empty title="Nothing here yet" text="Tap the star on any coin to keep an eye on it." to="/explore" cta="Explore markets"/>:<CoinTable coins={m.data||[]} cur={cur} loading={m.loading}/>}</>
}

const COLORS=['#3987FF','#FF405C','#22C55E','#F59E0B','#A78BFA','#14B8A6','#EC4899','#94A3B8']
export function Portfolio(){
  const {currency:cur,holdings,up,toast,refresh}=useApp(),[open,setOpen]=useState(false)
  const mine=holdings.filter(h=>h.cur===cur),other=holdings.length-mine.length
  const m=useApi(mine.length?marketsPath(cur,`&ids=${[...new Set(mine.map(h=>h.id))].join(',')}`):null,{every:refresh})
  const px=id=>m.data?.find(c=>c.id===id)?.current_price
  const rows=mine.map(h=>({...h,now:px(h.id),val:px(h.id)!=null?px(h.id)*h.qty:null,cost:h.qty*h.buy}))
  const val=rows.reduce((a,r)=>a+(r.val??0),0),cost=rows.reduce((a,r)=>a+r.cost,0),pl=val-cost
  const alloc=Object.values(rows.reduce((a,r)=>{(a[r.id]??={name:r.name,value:0}).value+=r.val??0;return a},{})).filter(x=>x.value>0)
  return <><div className="row"><Head t="Portfolio" s="A simulation tracker. No real trades, wallets or funds are involved."/><button className="btn" onClick={()=>setOpen(true)}><Plus size={16}/> Add holding</button></div>
    <Err msg={m.error}/>{other>0&&<p className="mut">{other} holding(s) were recorded in another currency. Switch currency in Settings to view them.</p>}
    {!mine.length?<Empty title="No holdings yet" text="Add a simulated holding to see its value, profit and allocation."/>:<>
      <div className="grid4"><Stat label="Current value">{money(val,cur)}</Stat><Stat label="Total invested">{money(cost,cur)}</Stat><Stat label="Profit / loss"><span className={pl>=0?'up':'down'}>{money(pl,cur)}</span></Stat><Stat label="Return"><Delta v={cost?pl/cost*100:0}/></Stat></div>
      <div className="grid2"><div className="card"><h3>Allocation</h3><div style={{height:240}}><ResponsiveContainer><PieChart><Pie data={alloc} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2} stroke="none">{alloc.map((_,i)=><Cell key={i} fill={COLORS[i%8]}/>)}</Pie><Tooltip formatter={v=>money(v,cur)} contentStyle={{background:'var(--card)',border:'1px solid var(--line)',borderRadius:12}}/></PieChart></ResponsiveContainer></div></div>
        <div className="card tbl"><table><thead><tr><th>Asset</th><th className="r">Qty</th><th className="r">Value</th><th className="r">P/L</th><th/></tr></thead><tbody>{rows.map(r=><tr key={r.key}><td><b>{r.name}</b></td><td className="r">{r.qty}</td><td className="r">{money(r.val,cur)}</td><td className={'r '+((r.val-r.cost)>=0?'up':'down')}>{r.val==null?'—':money(r.val-r.cost,cur)}</td><td><button className="ghost" aria-label="Remove" onClick={()=>{up('holdings',h=>h.filter(x=>x.key!==r.key));toast('Holding removed')}}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></div></>}
    {open&&<AddHolding cur={cur} onClose={()=>setOpen(false)} onAdd={h=>{up('holdings',l=>[...l,h]);toast(`${h.name} added to portfolio`);setOpen(false)}}/>}</>
}
function AddHolding({cur,onClose,onAdd}){
  const m=useApi(marketsPath(cur,'&per_page=100&page=1')),[id,setId]=useState('bitcoin'),[qty,setQty]=useState(''),[buy,setBuy]=useState('')
  const coin=m.data?.find(c=>c.id===id),ok=+qty>0&&+buy>=0&&buy!==''
  return <Modal title="Add simulated holding" onClose={onClose}>
    <label>Coin<select value={id} onChange={e=>setId(e.target.value)}>{(m.data||[{id:'bitcoin',name:'Bitcoin'}]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Quantity<input type="number" min="0" step="any" value={qty} onChange={e=>setQty(e.target.value)}/></label>
    <label>Purchase price per coin ({cur.toUpperCase()})<input type="number" min="0" step="any" value={buy} placeholder={coin?String(coin.current_price):''} onChange={e=>setBuy(e.target.value)}/></label>
    <p className="mut">Simulation only. Nothing is bought or stored outside this browser.</p>
    <Btn className="btn" disabled={!ok} onClick={()=>onAdd({key:Date.now(),id,name:coin?.name||id,qty:+qty,buy:+buy,cur})}>Add holding</Btn></Modal>
}

export function Settings(){
  const {theme,currency,refresh,up,toast}=useApp()
  return <><Head t="Settings"/>
    <div className="card form"><div className="row"><span>Theme</span><div className="seg">{[['dark','Dark',Moon],['light','Light',Sun]].map(([k,l,I])=><button key={k} className={theme===k?'on':''} onClick={()=>up('theme',k)}><I size={14}/> {l}</button>)}</div></div>
      <div className="row"><span>Currency</span><div className="seg">{['usd','inr'].map(k=><button key={k} className={currency===k?'on':''} onClick={()=>up('currency',k)}>{k.toUpperCase()}</button>)}</div></div>
      <div className="row"><span>Refresh every</span><select value={refresh} onChange={e=>up('refresh',+e.target.value)}>{[[30,'30 seconds'],[60,'1 minute'],[120,'2 minutes'],[300,'5 minutes']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
      <div className="row"><span>Saved data</span><button onClick={()=>{Object.keys(localStorage).filter(k=>k.startsWith('cp.')).forEach(k=>localStorage.removeItem(k));toast('Saved data cleared');setTimeout(()=>location.reload(),600)}}>Clear watchlist, portfolio and cache</button></div></div>
    <div className="card"><h3>About CryptoPulse</h3><p className="mut">CryptoPulse by arjuniverse. See the Market. Feel the Pulse. Market data comes from the public CoinGecko API and may be delayed or rate limited. The portfolio is a simulation and this is not financial advice.</p></div></>
}
