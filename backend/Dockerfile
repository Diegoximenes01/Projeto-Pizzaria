# Estágio de Build
FROM node:18-alpine AS builder

# Configura diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala todas as dependências (incluindo dev para o build TS)
RUN npm install

# Copia o código fonte
COPY . .

# Faz a compilação do TypeScript para a pasta dist
RUN npx tsc

# Copia o schema.graphql para a pasta dist (já que o TSC não copia arquivos que não são .ts)
RUN cp -r src/graphql/schema.graphql dist/graphql/

# Estágio de Produção
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --only=production

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /usr/src/app/dist ./dist

# Expõe a porta que a aplicação vai rodar
EXPOSE 4000

# Define variável de ambiente para produção
ENV NODE_ENV=production

# Executa a aplicação
CMD ["node", "dist/index.js"]
