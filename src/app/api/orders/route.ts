import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const sb = supabaseServer()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const table = searchParams.get('table')

  let query = sb.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  if (status) query = query.eq('status', status)
  if (table) query = query.eq('table_id', Number(table))
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ orders: data })
}
