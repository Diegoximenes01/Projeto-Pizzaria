import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import depthLimit from 'graphql-depth-limit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './graphql/resolvers';

async function startServer() {
  const app = express();

  // Middleware de Segurança (Helmet)
  // Configuração básica do helmet, adaptada para permitir o GraphQL Playground no ambiente de dev
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  }));

  // Rate Limiting para evitar força bruta / DDoS básico
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requests por windowMs por IP
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
  });
  app.use('/graphql', limiter);

  // Leitura do Schema GraphQL
  const typeDefs = readFileSync(join(__dirname, 'graphql', 'schema.graphql'), 'utf-8');

  // Inicialização do Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Prevenção de ataques de consultas profundas
    validationRules: [depthLimit(5)], // Máximo de 5 níveis de profundidade aninhados
    formatError: (err) => {
      // Ocultar detalhes de erro interno em produção
      if (process.env.NODE_ENV === 'production') {
        return new Error('Erro interno do servidor');
      }
      return err;
    }
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor:', error);
});
