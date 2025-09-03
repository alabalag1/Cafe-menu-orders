'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OrderStatus, Order } from '@/types'
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

    const t = setInterval(async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders ?? [])
    }, 5000)
    return () => clearInterval(t)
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
