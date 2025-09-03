'use client'

import { useEffect, useState } from 'react'
import type { OrderStatus, Order } from '@/types'
function money(cents: number) { return (cents/100).toFixed(2) + ' лв' }

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      // Filter for kitchen-relevant orders (not delivered or cancelled)
      const filteredOrders = (data.orders ?? []).filter((order: Order) => 
        !['delivered', 'cancelled'].includes(order.status)
      )
      setOrders(filteredOrders)
    }
    load()

    // Realtime via polling for simplicity (can wire Supabase Realtime later)
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/order/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) {
      // Optimistically update the order in state
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ).filter(order => !['delivered', 'cancelled'].includes(order.status)))
    } else {
      const error = await res.json().catch(() => ({ error: 'Failed to update status' }))
      alert(error.error || 'Failed to update status')
    }
  }

  const sorted = orders.sort((a,b) => a.created_at.localeCompare(b.created_at))

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
              <button onClick={()=>updateStatus(o.id,'accepted')}>Accept</button>
              <button onClick={()=>updateStatus(o.id,'in_progress')}>In progress</button>
              <button onClick={()=>updateStatus(o.id,'ready')}>Ready</button>
              <button onClick={()=>updateStatus(o.id,'delivered')}>Delivered</button>
              <button onClick={()=>updateStatus(o.id,'cancelled')}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
