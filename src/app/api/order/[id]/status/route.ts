import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/src/lib/supabaseClient'
import type { OrderStatus } from '@/src/types'

export async function POST(req: NextRequest, { params }: { params: { id: string }}) {
  const { status } = await req.json() as { status: OrderStatus }
  const sb = supabaseServer()
  const { data, error } = await sb.from('orders').update({ status }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await sb.from('order_events').insert({ order_id: params.id, event: `status:${status}` })
  return NextResponse.json({ ok: true, order: data })
}
