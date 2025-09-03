'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Category, MenuItem } from '@/types'

function money(cents: number) { return (cents/100).toFixed(2) + ' лв' }

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const [cart, setCart] = useState<Record<number, number>>({})
  const [note, setNote] = useState('')
  const [tableId, setTableId] = useState<number | null>(null)
  const [placing, setPlacing] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const t = url.searchParams.get('table')
    const token = url.searchParams.get('token')
    if (t) setTableId(Number(t))
    // If token exists, trust API to resolve table; keep tableId nullable
  }, [])

  useEffect(() => {
    const load = async () => {
      const res = await fetch(window.location.search ? `/api/menu${window.location.search}` : '/api/menu')
      const data = await res.json()
      setCategories(data.categories)
      setItems(data.items)
      setActiveCat(data.categories[0]?.id ?? null)
      if (!tableId && data.table_id) setTableId(data.table_id)
    }
    load()
  }, [])

  const totalCents = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = items.find(i => i.id === Number(id))
      return sum + (item ? item.price_cents * Number(qty) : 0)
    }, 0)
  }, [cart, items])

  const add = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  const dec = (id: number) => setCart(prev => {
    const q = (prev[id] ?? 0) - 1
    if (q <= 0) { const { [id]:_, ...rest } = prev; return rest }
    return { ...prev, [id]: q }
  })

  const placeOrder = async () => {
    if (!tableId) return alert('Missing table')
    const itemsArr = Object.entries(cart).map(([menuItemId, qty]) => ({ menuItemId: Number(menuItemId), qty: Number(qty) }))
    if (!itemsArr.length) return alert('Cart is empty')
    setPlacing(true)
    const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableId, items: itemsArr, note }) })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) { setCart({}); setLastOrderId(data.orderId) } else { alert(data.error ?? 'Failed to place order') }
  }

  return (
    <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
      <div className="glass card menu-hero" style={{ gridColumn: '1 / -1' }}>
        <div className="menu-hero-inner">
          <div>
            <div className="menu-hero-title">FIFA Nights · Play. Sip. Repeat.</div>
            <div className="menu-hero-sub">Grab a controller, order a drink, and enjoy the match.</div>
          </div>
          <div className="menu-hero-badge">Table {tableId ?? '—'}</div>
        </div>
      </div>
      <aside className="sidebar">
        <h2 style={{ marginTop: 0 }}>Категории</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {categories.map(c => (
            <li key={c.id} style={{ marginBottom: 8 }}>
              <button className={`category-btn ${activeCat===c.id? 'active':''}`} onClick={() => setActiveCat(c.id)}>{c.name}</button>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <h2 style={{ marginTop: 0 }}>Меню</h2>
        <div className="items-grid">
          {items.filter(i => !activeCat || i.category_id === activeCat).map(i => (
            <div key={i.id} className="glass card item-card">
              <div className="item-title">{i.name}</div>
              <div className="item-desc">{i.description}</div>
              <div><span className="chip">{money(i.price_cents)}</span></div>
              <div className="qty-row">
                <button className="btn ghost" onClick={()=>dec(i.id)}>-</button>
                <span>{cart[i.id] ?? 0}</span>
                <button className="btn ghost" onClick={()=>add(i.id)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass cart-bar">
          <div className="cart-row">
            <input className="input" placeholder="Бележка към поръчката" value={note} onChange={e=>setNote(e.target.value)} style={{ flex: 1 }} />
            <strong>Общо: {money(totalCents)}</strong>
            <button className="btn primary" onClick={placeOrder} disabled={placing}>{placing? 'Изпращане...' : 'Изпрати поръчка'}</button>
          </div>
          {lastOrderId && <p style={{ marginTop: 8 }}>Поръчка изпратена! ID: <code>{lastOrderId}</code></p>}
        </div>
      </section>
    </div>
  )
}
