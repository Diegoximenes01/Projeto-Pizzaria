import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    pizzas: async () => await prisma.pizza.findMany(),
    pizza: async (_: any, { id }: { id: string }) => await prisma.pizza.findUnique({ where: { id } }),
    pedidos: async () => await prisma.pedido.findMany({ include: { itens: { include: { pizza: true } }, usuario: true } }),
    pedido: async (_: any, { id }: { id: string }) => await prisma.pedido.findUnique({ where: { id }, include: { itens: { include: { pizza: true } }, usuario: true } }),
    pedidosUsuario: async (_: any, { usuarioId }: { usuarioId: string }) => await prisma.pedido.findMany({ where: { usuarioId }, include: { itens: { include: { pizza: true } }, usuario: true } }),
    login: async (_: any, { cpf, senha }: { cpf: string, senha: string }) => {
      const usuario = await prisma.usuario.findUnique({ where: { cpf } });
      if (!usuario || usuario.senha !== senha) {
        throw new Error('CPF ou senha inválidos');
      }
      return usuario;
    }
  },
  Mutation: {
    cadastrarUsuario: async (_: any, args: any) => {
      // Simples, sem hash real para agilizar no ambiente lab
      const usuario = await prisma.usuario.create({
        data: {
          nome: args.nome,
          cpf: args.cpf,
          email: args.email,
          telefone: args.telefone,
          senha: args.senha,
          endereco: args.endereco,
          enderecos: [args.endereco]
        }
      });
      return usuario;
    },
    redefinirSenha: async (_: any, { cpf, novaSenha }: { cpf: string, novaSenha: string }) => {
      const usuario = await prisma.usuario.findUnique({ where: { cpf } });
      if (!usuario) {
        throw new Error('Usuário com este CPF não foi cadastrado');
      }
      const usuarioAtualizado = await prisma.usuario.update({
        where: { cpf },
        data: { senha: novaSenha }
      });
      return usuarioAtualizado;
    },
    atualizarEnderecos: async (_: any, { usuarioId, enderecos }: { usuarioId: string, enderecos: string[] }) => {
      const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      return await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          enderecos,
          endereco: enderecos[enderecos.length - 1] || usuario.endereco
        }
      });
    },
    criarPedido: async (_: any, args: any) => {
      let totalItens = 0;
      
      for (const item of args.itens) {
        const pizza = await prisma.pizza.findUnique({ where: { id: item.pizzaId } });
        if (!pizza) throw new Error(`Pizza não encontrada`);
        totalItens += pizza.preco * item.quantidade;
      }

      const totalFinal = totalItens + (args.taxaEntrega || 0);

      const novoPedido = await prisma.pedido.create({
        data: {
          total: Number(totalFinal.toFixed(2)),
          status: 'Recebido',
          tipoEntrega: args.tipoEntrega || 'Retirada',
          taxaEntrega: args.taxaEntrega || 0.0,
          tipoPagamento: args.tipoPagamento || 'Dinheiro',
          trocoPara: args.trocoPara,
          usuarioId: args.usuarioId,
          itens: {
            create: args.itens.map((item: any) => ({
              quantidade: item.quantidade,
              pizza: { connect: { id: item.pizzaId } }
            }))
          }
        },
        include: {
          itens: { include: { pizza: true } },
          usuario: true
        }
      });

      return novoPedido;
    },
  },
};
