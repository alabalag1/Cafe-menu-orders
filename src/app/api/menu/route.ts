import { NextResponse } from 'next/server'
import { supabaseServer } from '@/src/lib/supabaseClient'

export async function GET() {
  try {
    const sb = supabaseServer()
    const { data: cats, error: cErr } = await sb.from('categories').select('*').order('sort_order', { ascending: true })
    const { data: items, error: iErr } = await sb.from('menu_items').select('*')
    if (cErr || iErr) throw new Error(cErr?.message || iErr?.message)
    return NextResponse.json({ categories: cats ?? [], items: items ?? [] })
  } catch (e:any) {
    // fallback demo data for first run
    return NextResponse.json({
      categories: [{ id: 1, name: 'Кафета', sort_order: 0 }, { id: 2, name: 'Десерти', sort_order: 1 }],
      items: [
        { id: 1, category_id: 1, name: 'Еспресо', description: 'Двойно', price_cents: 250, is_available: true },
        { id: 2, category_id: 1, name: 'Капучино', description: '250ml', price_cents: 390, is_available: true },
        { id: 3, category_id: 2, name: 'Тирамису', description: '', price_cents: 690, is_available: true }
      ]
    })
  }
}
