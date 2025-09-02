import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { products: { where: { isAvailable: true } } }
  })
  return NextResponse.json({ categories })
}
