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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      <aside>
        <h2>Категории</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map(c => (
            <li key={c.id}>
              <button onClick={() => setActiveCat(c.id)} style={{ padding: '8px 10px', margin: '4px 0', width: '100%', background: activeCat===c.id? '#efefef':'#fff', border: '1px solid #ddd', borderRadius: 8 }}>{c.name}</button>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <h2>Меню</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {items.filter(i => !activeCat || i.category_id === activeCat).map(i => (
            <div key={i.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{i.name}</div>
              <div style={{ color: '#666', minHeight: 36 }}>{i.description}</div>
              <div style={{ marginTop: 8 }}>{money(i.price_cents)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={()=>dec(i.id)}>-</button>
                <span>{cart[i.id] ?? 0}</span>
                <button onClick={()=>add(i.id)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'sticky', bottom: 16, marginTop: 24, padding: 12, border: '1px solid #ddd', borderRadius: 12, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input placeholder="Бележка към поръчката" value={note} onChange={e=>setNote(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
            <strong>Общо: {money(totalCents)}</strong>
            <button onClick={placeOrder} disabled={placing} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #111' }}>{placing? 'Изпращане...' : 'Изпрати поръчка'}</button>
          </div>
          {lastOrderId && <p style={{ marginTop: 8 }}>Поръчка изпратена! ID: <code>{lastOrderId}</code></p>}
        </div>
      </section>
    </div>
  )
}
