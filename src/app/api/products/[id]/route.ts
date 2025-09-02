import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  const id = Number(params.id)
  const patch = await req.json()
  const sb = supabaseServer()
  const { data, error } = await sb.from('menu_items').update(patch).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ product: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string }}) {
  const id = Number(params.id)
  const sb = supabaseServer()
  const { error } = await sb.from('menu_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
