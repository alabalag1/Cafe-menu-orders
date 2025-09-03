import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET() {
  const sb = supabaseServer()
  const { data, error } = await sb.from('menu_items').select('*').order('id', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ products: data })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const payload = {
      name: body.name,
      description: body.description ?? null,
      price_cents: Number(body.price_cents),
      category_id: body.category_id ?? null,
      is_available: body.is_available ?? true,
      image_url: body.image_url ?? null
    }
    
    if (!payload.name || !payload.price_cents) {
      return NextResponse.json({ error: 'Name and price_cents required' }, { status: 400 })
    }
    
    const sb = supabaseServer()
    const { data, error } = await sb.from('menu_items').insert(payload).select().single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 400 })
    }
    
    return NextResponse.json({ product: data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
