'use client'

import { useEffect, useMemo, useState } from 'react'

type Category = { id: number; name: string }
type Product = { id: number; category_id: number | null; name: string; description?: string | null; price_cents: number; is_available: boolean; image_url?: string | null }

function money(cents: number) { return (cents/100).toFixed(2) + ' лв' }

export default function AdminProducts() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Product>>({ name: '', price_cents: 0, is_available: true })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<string>('')

  const load = async () => {
    setLoading(true)
    const [catsRes, listRes] = await Promise.all([ fetch('/api/menu'), fetch('/api/products') ])
    const catsJson = await catsRes.json()
    const listJson = await listRes.json()
    setCategories(catsJson.categories ?? [])
    setProducts(listJson.products ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    if (!form.name || !form.price_cents) return alert('Name and price required')
    setSaving(true)
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(()=>({} as any))
      return alert(j.error ?? 'Failed to create')
    }
    setForm({ name: '', description: '', price_cents: 0, category_id: categories[0]?.id ?? null, is_available: true, image_url: '' })
    await load()
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(p => p.filter(x => x.id !== id))
  }

  const onToggleAvailable = async (id: number, is_available: boolean) => {
    const res = await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ is_available }) })
    if (res.ok) setProducts(p => p.map(x => x.id===id? { ...x, is_available }: x))
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    let arr = products.slice()
    if (q) arr = arr.filter(p => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
    return arr.sort((a,b) => a.name.localeCompare(b.name))
  }, [products, filter])

  return (
    <div>
      <h1>Admin · Products</h1>
      <p style={{ color: '#666' }}>Create, edit, and toggle availability of menu products.</p>

      <section style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Create product</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input placeholder="Name" value={form.name ?? ''} onChange={e=>setForm({ ...form, name: e.target.value })} />
          <input placeholder="Price (cents)" type="number" value={form.price_cents ?? 0} onChange={e=>setForm({ ...form, price_cents: Number(e.target.value) })} />
          <input placeholder="Description" value={form.description ?? ''} onChange={e=>setForm({ ...form, description: e.target.value })} />
          <input placeholder="Image URL" value={form.image_url ?? ''} onChange={e=>setForm({ ...form, image_url: e.target.value })} />
          <select value={form.category_id ?? ''} onChange={e=>setForm({ ...form, category_id: e.target.value === '' ? null : Number(e.target.value) })}>
            <option value="">No category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label>
            <input type="checkbox" checked={form.is_available ?? true} onChange={e=>setForm({ ...form, is_available: e.target.checked })} /> Available
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={onCreate} disabled={saving}>{saving? 'Saving...' : 'Create'}</button>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Products</h2>
          <input placeholder="Search..." value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
        {loading ? <p>Loading…</p> : (
          <table cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th align="left">Name</th><th align="left">Category</th><th align="left">Price</th><th align="left">Available</th><th align="left">Image</th><th></th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                  <td>{p.name}<div style={{ color: '#666', fontSize: 12 }}>{p.description}</div></td>
                  <td>{categories.find(c => c.id === p.category_id)?.name ?? '—'}</td>
                  <td>{money(p.price_cents)}</td>
                  <td>
                    <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <input type="checkbox" checked={p.is_available} onChange={e=>onToggleAvailable(p.id, e.target.checked)} /> {p.is_available? 'Yes':'No'}
                    </label>
                  </td>
                  <td>{p.image_url ? <a href={p.image_url} target="_blank">Image</a> : '—'}</td>
                  <td><button onClick={()=>onDelete(p.id)} style={{ color: 'crimson' }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
