import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.pizza.deleteMany(); // Limpa as pizzas antes de seedar

  // TRADICIONAIS
  await prisma.pizza.create({
    data: {
      nome: 'Mussarela',
      preco: 39.9,
      ingredientes: ['Molho de tomate', 'Mussarela abundante', 'Orégano'],
      categoria: 'Tradicional'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: 'Calabresa',
      preco: 42.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Calabresa fatiada', 'Cebola'],
      categoria: 'Tradicional'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: 'Marguerita',
      preco: 44.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Manjericão fresco', 'Tomate'],
      categoria: 'Tradicional'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: 'Portuguesa',
      preco: 48.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Presunto', 'Ovo', 'Cebola', 'Ervilha'],
      categoria: 'Tradicional'
    }
  });

  // ESPECIAIS
  await prisma.pizza.create({
    data: {
      nome: 'Pepperoni com Catupiry',
      preco: 58.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Pepperoni', 'Catupiry original'],
      categoria: 'Especial'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: '4 Queijos',
      preco: 56.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Provolone', 'Parmesão', 'Gorgonzola'],
      categoria: 'Especial'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: 'Frango com Catupiry',
      preco: 55.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Frango desfiado temperado', 'Catupiry'],
      categoria: 'Especial'
    }
  });

  await prisma.pizza.create({
    data: {
      nome: 'Carne de Sol com Queijo Coalho',
      preco: 64.9,
      ingredientes: ['Molho de tomate', 'Mussarela', 'Carne de sol desfiada', 'Queijo coalho', 'Cebola roxa'],
      categoria: 'Especial'
    }
  });

  console.log('Seed de pizzas completado!');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
