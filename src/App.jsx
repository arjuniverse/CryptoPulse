import {NavLink,Routes,Route,useLocation} from 'react-router-dom'
import {LayoutDashboard,Compass,Star,PieChart,Settings as Cog} from 'lucide-react'
import {Brand} from './ui.jsx'
import {Dashboard,Explore,Coin,Watchlist,Portfolio,Settings} from './pages.jsx'
const nav=[['/','Dashboard',LayoutDashboard],['/explore','Explore',Compass],['/watchlist','Watchlist',Star],['/portfolio','Portfolio',PieChart],['/settings','Settings',Cog]]
const Links=()=>nav.map(([to,l,I])=><NavLink key={to} to={to} end={to==='/'}><I size={19}/><span>{l}</span></NavLink>)
export default function App(){
  const {pathname}=useLocation()
  return <div className="shell">
    <aside className="side"><Brand/><nav><Links/></nav><p className="tag">See the Market.<br/>Feel the Pulse.</p></aside>
    <main><div className="mobtop"><Brand/></div>
      <div key={pathname} className="page"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/explore" element={<Explore/>}/><Route path="/coin/:id" element={<Coin/>}/><Route path="/watchlist" element={<Watchlist/>}/><Route path="/portfolio" element={<Portfolio/>}/><Route path="/settings" element={<Settings/>}/><Route path="*" element={<Explore/>}/></Routes></div>
      <footer>CryptoPulse by arjuniverse · Market data from CoinGecko · Not financial advice</footer></main>
    <nav className="tabs"><Links/></nav></div>
}
