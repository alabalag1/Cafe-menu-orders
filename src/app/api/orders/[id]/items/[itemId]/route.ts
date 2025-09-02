import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getSessionUser } from '@/src/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({ quantity: z.number().int().min(1).max(99), note: z.string().optional() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string, itemId: string } }) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order || (order.customerId !== user.id && !['waiter','admin'].includes(user.role))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const parse = updateSchema.safeParse(await req.json())
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const item = await prisma.orderItem.update({
    where: { id: params.itemId },
    data: {
      quantity: parse.data.quantity,
      note: parse.data.note,
      lineTotalCents: parse.data.quantity * (await getPrice(params.itemId)),
    },
  })
  await recomputeSubtotal(params.id)
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, itemId: string } }) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order || (order.customerId !== user.id && !['waiter','admin'].includes(user.role))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.orderItem.delete({ where: { id: params.itemId } })
  await recomputeSubtotal(params.id)
  return NextResponse.json({ ok: true })
}

async function getPrice(itemId: string) {
  const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { product: true } })
  return item?.product.priceCents || 0
}

async function recomputeSubtotal(orderId: string) {
  const totals = await prisma.orderItem.groupBy({
    by: ['orderId'],
    where: { orderId },
    _sum: { lineTotalCents: true },
  })
  const subtotal = totals[0]?._sum.lineTotalCents ?? 0
  await prisma.order.update({ where: { id: orderId }, data: { subtotalCents: subtotal } })
}
