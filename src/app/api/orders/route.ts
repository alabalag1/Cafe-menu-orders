import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getSessionUser } from '@/src/lib/auth'
import { z } from 'zod'

const createOrderSchema = z.object({ tableToken: z.string() })

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parse = createOrderSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const table = await prisma.table.findUnique({ where: { tableToken: parse.data.tableToken } })
  if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 })
  try {
    const existing = await prisma.order.findFirst({
      where: { tableId: table.id, status: { in: ['open','submitted','preparing','ready','served'] } }
    })
    if (existing) return NextResponse.json(existing)
    const order = await prisma.order.create({
      data: { tableId: table.id, customerId: user.id }
    })
    return NextResponse.json(order)
  } catch (e:any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Table already has open order' }, { status: 409 })
    }
    throw e
  }
}
