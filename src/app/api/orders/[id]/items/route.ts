import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getSessionUser } from '@/src/lib/auth'
import { z } from 'zod'

const itemSchema = z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99), note: z.string().optional() })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parse = itemSchema.safeParse(await req.json())
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order || (order.customerId !== user.id && !['waiter','admin'].includes(user.role))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const product = await prisma.product.findUnique({ where: { id: parse.data.productId } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  const item = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product.id,
      quantity: parse.data.quantity,
      note: parse.data.note,
      lineTotalCents: product.priceCents * parse.data.quantity,
    },
  })
  await recomputeSubtotal(order.id)
  return NextResponse.json(item)
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
