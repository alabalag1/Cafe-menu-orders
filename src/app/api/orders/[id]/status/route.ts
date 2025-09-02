import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getSessionUser } from '@/src/lib/auth'
import { z } from 'zod'

const statusSchema = z.object({ status: z.enum(['open','submitted','preparing','ready','served','closed','cancelled']) })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req)
  if (!user || !['waiter','admin'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parse = statusSchema.safeParse(await req.json())
  if (!parse.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const order = await prisma.order.update({ where: { id: params.id }, data: { status: parse.data.status } })
  return NextResponse.json(order)
}
