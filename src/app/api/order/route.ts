import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/src/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { tableId, items, note } = await req.json()
  if (!tableId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const sb = supabaseServer()
  const { data: menuRows, error } = await sb.from('menu_items').select('id, price_cents, is_available').in('id', items.map((i:any)=>i.menuItemId))
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const unavailable = (menuRows ?? []).filter(m => !m.is_available)
  if (unavailable.length) return NextResponse.json({ error: 'Some items unavailable' }, { status: 409 })
  const priceMap = new Map((menuRows ?? []).map((m:any)=>[m.id, m.price_cents]))
  const total_cents = items.reduce((sum:number, i:any)=> sum + (priceMap.get(i.menuItemId) * i.qty), 0)

  const { data: order, error: insErr } = await sb.from('orders').insert({ table_id: tableId, total_cents, note }).select().single()
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })

  const orderItems = items.map((i:any)=>({ order_id: order.id, menu_item_id: i.menuItemId, qty: i.qty, price_cents: priceMap.get(i.menuItemId) }))
  const { error: oiErr } = await sb.from('order_items').insert(orderItems)
  if (oiErr) return NextResponse.json({ error: oiErr.message }, { status: 400 })

  await sb.from('order_events').insert({ order_id: order.id, event: 'created' })
  return NextResponse.json({ orderId: order.id, total_cents })
}
