import { PrismaClient, Role } from '@prisma/client'
import { randomBytes } from 'crypto'
import fs from 'fs'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

async function main() {
  // Users
  await prisma.user.createMany({
    data: [
      { id: crypto.randomUUID(), email: 'admin@example.com', role: Role.admin },
      { id: crypto.randomUUID(), email: 'waiter@example.com', role: Role.waiter },
      { id: crypto.randomUUID(), email: 'customer@example.com', role: Role.customer },
    ],
    skipDuplicates: true,
  })

  // Tables with QR tokens
  for (let i = 1; i <= 12; i++) {
    const token = randomBytes(16).toString('hex')
    const table = await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: {
        name: `T${i}`,
        number: i,
        capacity: 4,
        tableToken: token,
      },
    })
    const qrDir = './qr'
    fs.mkdirSync(qrDir, { recursive: true })
    const url = `http://localhost:3000/table?token=${table.tableToken}`
    const svg = await QRCode.toString(url, { type: 'svg' })
    fs.writeFileSync(`${qrDir}/table-${i}.svg`, svg)
  }

  // Categories & products
  const categories = [
    { name: 'Burgers', products: [
      { name: 'Classic Burger', priceCents: 1299 },
      { name: 'Cheeseburger', priceCents: 1399 },
      { name: 'Veggie Burger', priceCents: 1199 },
    ]},
    { name: 'Salads', products: [
      { name: 'Caesar Salad', priceCents: 999 },
      { name: 'Greek Salad', priceCents: 899 },
    ]},
    { name: 'Beverages', products: [
      { name: 'Espresso', priceCents: 399 },
      { name: 'Cappuccino', priceCents: 499 },
      { name: 'Fresh Lemonade', priceCents: 599 },
    ]},
    { name: 'Desserts', products: [
      { name: 'Chocolate Brownie', priceCents: 699 },
      { name: 'Cheesecake', priceCents: 799 },
    ]},
  ]

  for (const [idx, cat] of categories.entries()) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        sortOrder: idx,
      },
    })
    for (const p of cat.products) {
      await prisma.product.upsert({
        where: { name: p.name },
        update: {
          priceCents: p.priceCents,
          categoryId: c.id,
        },
        create: {
          name: p.name,
          priceCents: p.priceCents,
          categoryId: c.id,
        },
      })
    }
  }

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
