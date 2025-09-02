'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '../../lib/supabaseClient'
import type { OrderStatus } from '../../types'

interface Order {
  id: string
  table_id: number
  status: OrderStatus
  created_at: string
  total_cents: number
}

function money(cents: number) { return (cents / 100).toFixed(2) + ' лв' }

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/orders?status=pending')
      const data = await res.json()
      setOrders(data.orders ?? [])
    }
    load()

    const sb = supabaseBrowser()
    const ch = sb.channel('orders:kitchen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const o = (payload.new ?? payload.old) as Order
        setOrders(prev => {
          const idx = prev.findIndex(p => p.id === o.id)
          if (idx >= 0) { const copy = prev.slice(); copy[idx] = o; return copy }
          return [o, ...prev]
        })
      }).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    await fetch(`/api/order/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }

  const sorted = orders.sort((a, b) => a.created_at.localeCompare(b.created_at))

  return (
    <div>
      <h1>Kitchen</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {sorted.map(o => (
          <div key={o.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <div><strong>Table {o.table_id}</strong></div>
            <div>Status: <code>{o.status}</code></div>
            <div>Created: {new Date(o.created_at).toLocaleTimeString()}</div>
            <div>Total: {money(o.total_cents)}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={() => updateStatus(o.id, 'accepted')}>Accept</button>
              <button onClick={() => updateStatus(o.id, 'in_progress')}>In progress</button>
              <button onClick={() => updateStatus(o.id, 'ready')}>Ready</button>
              <button onClick={() => updateStatus(o.id, 'delivered')}>Delivered</button>
              <button onClick={() => updateStatus(o.id, 'cancelled')}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
