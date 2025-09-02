import React from 'react'
import { notFound } from 'next/navigation'

export default function TablePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token
  if (!token) return notFound()
  return <div className="p-4">Table token: {token}</div>
}
