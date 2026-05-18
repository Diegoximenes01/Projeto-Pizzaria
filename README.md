# 🍕 Projeto Pizzaria - Furreti Cucina

Este é um sistema completo de e-commerce e gerenciamento de pedidos para uma pizzaria, desenvolvido com foco em uma experiência de usuário moderna, rápida e responsiva. O projeto possui um fluxo de ponta a ponta (end-to-end), desde a escolha dos produtos até a finalização do pagamento e registro no banco de dados.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React (Vite)**: Biblioteca para construção de interfaces.
- **Apollo Client**: Gerenciamento de estado e requisições GraphQL.
- **React Router**: Navegação entre as páginas (Home, Login, Carrinho, Entrega, Pagamento, Sucesso).
- **Lucide React**: Ícones modernos e responsivos.
- **Vanilla CSS**: Estilização rica e flexível sem dependência excessiva de frameworks.

### Backend
- **Node.js**: Ambiente de execução JavaScript/TypeScript.
- **GraphQL (Apollo Server)**: API flexível e tipada para comunicação entre o frontend e backend.
- **Prisma ORM**: Mapeamento objeto-relacional para interação com o banco de dados.
- **TypeScript**: Tipagem estática para maior segurança e produtividade no desenvolvimento.

### Infraestrutura & Banco de Dados
- **PostgreSQL**: Banco de dados relacional robusto para armazenamento de usuários, pedidos e produtos.
- **Docker & Docker Compose**: Containerização de toda a aplicação (API + Banco de Dados), garantindo que o ambiente rode de maneira idêntica em qualquer máquina.

## ✨ Funcionalidades

- **Autenticação de Usuários**: Fluxo de Cadastro e Login seguro.
- **Catálogo de Produtos**: Visualização de pizzas com preços e imagens.
- **Carrinho de Compras**: Adicionar/remover itens e visualização do total em tempo real (State Management via Context API).
- **Opções de Logística**: Seleção entre "Entrega em Domicílio" (com cálculo de taxa baseada no CEP) e "Retirada no Balcão".
- **Pagamento Simulado**: Suporte a Pix (com QR Code gerado em tempo real), Cartão de Crédito e Dinheiro (com cálculo inteligente de troco).
- **Histórico e Persistência**: Todos os pedidos e dados são persistidos de forma segura no PostgreSQL através do GraphQL.

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos
- [Docker](https://www.docker.com/products/docker-desktop) instalado e rodando.
- [Node.js](https://nodejs.org/en/) (versão 18+ recomendada) para rodar o frontend.

### Passo 1: Subir a Infraestrutura (Backend + Banco de Dados)
Na raiz do projeto (onde se encontra o arquivo `docker-compose.yml`), abra um terminal e execute:
```bash
docker-compose up -d
```
*Isso fará o download das imagens necessárias (Node e Postgres), construirá o backend e disponibilizará a API GraphQL em `http://localhost:4000`.*

### Passo 2: Iniciar o Frontend
Em um novo terminal, acesse a pasta do frontend e inicie o servidor de desenvolvimento:
```bash
cd frontend-react
npm install
npm run dev
```
*O site estará disponível em `http://localhost:5173/`.*

## 📂 Estrutura do Projeto

- `/backend`: Contém a API Node.js, os esquemas do Prisma, resolvers e definitions do GraphQL.
- `/frontend-react`: Contém a aplicação React, componentes, páginas, estilos e a configuração do Apollo Client.
- `docker-compose.yml`: Arquivo de orquestração para rodar o Backend e o PostgreSQL simultaneamente.

---
*Desenvolvido como parte do projeto universitário (Cadeira Nuvem).*
