import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p1 = await prisma.pizza.create({
    data: {
      nome: 'Margherita',
      preco: 45.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Manjericão']
    }
  })

  const p2 = await prisma.pizza.create({
    data: {
      nome: 'Calabresa',
      preco: 49.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Calabresa', 'Cebola']
    }
  })

  const p3 = await prisma.pizza.create({
    data: {
      nome: 'Quatro Queijos',
      preco: 55.0,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Provolone', 'Parmesão', 'Gorgonzola']
    }
  })

  console.log({ p1, p2, p3 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
