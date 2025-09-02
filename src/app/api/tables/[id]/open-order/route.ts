import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getSessionUser } from '@/src/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req)
  const order = await prisma.order.findFirst({
    where: { tableId: params.id, status: { in: ['open','submitted','preparing','ready','served'] } },
    include: { items: true }
  })
  if (!order) return NextResponse.json(null)
  if (user?.role === 'waiter' || user?.role === 'admin' || order.customerId === user?.id) {
    return NextResponse.json(order)
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
