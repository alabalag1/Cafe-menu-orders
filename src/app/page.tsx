import React from 'react'

async function getMenu() {
  const res = await fetch('http://localhost:3000/api/menu', { cache: 'no-store' })
  const data = await res.json()
  return data.categories as any[]
}

export default async function Home() {
  const categories = await getMenu()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Menu</h1>
      {categories.map((c) => (
        <section key={c.id}>
          <h2 className="text-xl font-semibold mb-2">{c.name}</h2>
          <ul className="grid grid-cols-1 gap-4">
            {c.products.map((p:any) => (
              <li key={p.id} className="border p-3 rounded">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">${(p.priceCents/100).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
