'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/src/lib/supabaseClient'
import type { OrderStatus } from '@/src/types'

interface Order {
  id: string
  table_id: number
  status: OrderStatus
  created_at: string
  total_cents: number
}

function money(cents: number) { return (cents/100).toFixed(2) + ' лв' }

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filterTable, setFilterTable] = useState<number | ''>('' as any)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders ?? [])
    }
    load()

    const sb = supabaseBrowser()
    const ch = sb.channel('orders:waiter')
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

  const filtered = useMemo(() => {
    let arr = orders.slice()
    if (filterTable !== '') arr = arr.filter(o => o.table_id === Number(filterTable))
    return arr.sort((a,b) => b.created_at.localeCompare(a.created_at))
  }, [orders, filterTable])

  return (
    <div>
      <h1>Orders</h1>
      <div style={{ margin: '8px 0' }}>
        <input placeholder="Filter by table" value={filterTable} onChange={e=>setFilterTable(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
      <table cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th align="left">Time</th><th align="left">Table</th><th align="left">Status</th><th align="right">Total</th></tr></thead>
        <tbody>
          {filtered.map(o => (
            <tr key={o.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{new Date(o.created_at).toLocaleTimeString()}</td>
              <td>{o.table_id}</td>
              <td><code>{o.status}</code></td>
              <td align="right">{money(o.total_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
