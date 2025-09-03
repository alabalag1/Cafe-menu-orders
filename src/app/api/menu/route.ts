import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { supabaseServer } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  const sb = supabaseServer()
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const tableParam = searchParams.get('table')
  let tableId: number | null = null

  if (token) {
    const { data: t, error } = await sb.from('tables').select('id').eq('qr_token', token).single()
    if (!error && t) tableId = t.id
  } else if (tableParam) {
    tableId = Number(tableParam)
  }

  // 1) Fetch items first (source of truth for what to show)
  const { data: items, error: itemsError } = await sb
    .from('menu_items')
    .select('*')
    .order('id', { ascending: true })
  if (itemsError) {
    console.error('Menu items error:', itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 400 })
  }

  // Extract unique category ids referenced by items
  const categoryIds = Array.from(new Set((items || []).map(i => i.category_id).filter((v): v is number => typeof v === 'number')))

  // 2) Fetch only the categories used by those items
  let categories: any[] = []
  if (categoryIds.length > 0) {
    const { data: cats, error: catError } = await sb
      .from('categories')
      .select('*')
      .in('id', categoryIds)
      .order('sort_order', { ascending: true })
    if (catError) {
      console.error('Categories error:', catError)
    } else {
      categories = cats || []
    }
  }

  // 3) Fallback: if no categories returned, derive from items
  if (categories.length === 0 && (items || []).length > 0) {
    const derived = Array.from(new Set((items || []).map(i => i.category_id).filter((v): v is number => typeof v === 'number')))
      .map((id, idx) => ({ id, name: `Категория ${idx + 1}`, sort_order: idx }))
    categories = derived
  }

  console.log('Menu API FINAL - Categories:', categories.length, 'Items:', items?.length || 0)

  return NextResponse.json({
    categories,
    items: items || [],
    table_id: tableId
  })
}
