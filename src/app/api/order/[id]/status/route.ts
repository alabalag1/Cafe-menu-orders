import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'
import type { OrderStatus } from '@/types'

export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const { status } = await req.json() as { status: OrderStatus }
    
    // Validate status
    const validStatuses: OrderStatus[] = ['pending', 'accepted', 'in_progress', 'ready', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    
    const sb = supabaseServer()
    const { data, error } = await sb.from('orders').update({ status }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    
    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    await sb.from('order_events').insert({ order_id: params.id, event: `status:${status}` })
    return NextResponse.json({ ok: true, order: data })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
