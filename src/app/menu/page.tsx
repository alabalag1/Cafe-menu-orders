'use client'
import { useEffect,useMemo,useState } from 'react'
import type {Category,MenuItem} from '@/types'
const money=(c:number)=> (c/100).toFixed(2)+' лв'
export default function Menu(){
 const [categories,setCategories]=useState<Category[]>([])
 const [items,setItems]=useState<MenuItem[]>([])
 const [active,setActive]=useState<number>(0)
 const [cart,setCart]=useState<Record<number,number>>({})
 const [note,setNote]=useState('');const [table,setTable]=useState(1)
 const [placing,setPlacing]=useState(false);const [last,setLast]=useState<string|null>(null)
 useEffect(()=>{const t=new URL(window.location.href).searchParams.get('table');setTable(t?Number(t):1)},[])
 useEffect(()=>{(async()=>{const r=await fetch('/api/menu');const d=await r.json();setCategories([{id:0,name:'Всички',sort_order:-1},...(d.categories??[])]);setItems(d.items??[]);setActive(0)})()},[])
 const filtered=useMemo(()=>items.filter(i=>active===0||i.category_id===active),[items,active])
 const total=useMemo(()=>Object.entries(cart).reduce((s,[id,q])=>{const it=items.find(i=>i.id===+id);return s+(it?it.price_cents*+q:0)},0),[cart,items])
 const add=(id:number)=>setCart(p=>({...p,[id]:(p[id]??0)+1}))
 const dec=(id:number)=>setCart(p=>{const q=(p[id]??0)-1; if(q<=0){const {[id]:_,...r}=p;return r} return {...p,[id]:q}})
 const place=async()=>{const arr=Object.entries(cart).map(([menuItemId,qty])=>({menuItemId:+menuItemId,qty:+qty})); if(!arr.length) return alert('Количката е празна'); setPlacing(true); const res=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tableId:table,items:arr,note})}); const data=await res.json(); setPlacing(false); if(res.ok){setCart({});setLast(data.orderId)} else alert(data.error||'Грешка')}
 return <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16}}>
  <aside><h2>Категории</h2><ul style={{listStyle:'none',padding:0}}>{categories.map(c=><li key={c.id}><button onClick={()=>setActive(c.id)} style={{padding:'8px 10px',margin:'4px 0',width:'100%',background:active===c.id?'#efefef':'#fff',border:'1px solid #ddd',borderRadius:8}}>{c.name}</button></li>)}</ul></aside>
  <section><h2>Меню</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
   {filtered.map(i=><div key={i.id} style={{border:'1px solid #eee',borderRadius:12,padding:12}}><div style={{fontWeight:600}}>{i.name}</div><div style={{color:'#666',minHeight:36}}>{i.description}</div><div style={{marginTop:8}}>{money(i.price_cents)}</div><div style={{display:'flex',gap:8,marginTop:8}}><button onClick={()=>dec(i.id)}>-</button><span>{cart[i.id]??0}</span><button onClick={()=>add(i.id)}>+</button></div></div>)}
  </div>
  <div style={{position:'sticky',bottom:16,marginTop:24,padding:12,border:'1px solid #ddd',borderRadius:12,background:'#fff'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
    <input placeholder="Бележка към поръчката" value={note} onChange={e=>setNote(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:'1px solid #ddd'}}/>
    <strong>Общо: {money(total)}</strong>
    <button onClick={place} disabled={placing} style={{padding:'10px 16px',borderRadius:10,border:'1px solid #111'}}>{placing?'Изпращане...':'Изпрати поръчка'}</button>
   </div>
   {last && <p style={{marginTop:8}}>Поръчка изпратена! ID: <code>{last}</code></p>}
  </div>
  </section>
 </div>
}
