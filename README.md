# 🍕 Furreti Cucina - Ecossistema Full-Stack de Pizzaria & Computação em Nuvem

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SOAP](https://img.shields.io/badge/SOAP-WSDL-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Angular](https://img.shields.io/badge/Angular_19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

Este é um ecossistema **Full-Stack heterogêneo e distribuído** desenvolvido para a disciplina de **Computação em Nuvem**. O projeto simula o fluxo completo de negócios de uma pizzaria moderna (*Furreti Cucina*), combinando **múltiplos paradigmas de comunicação de dados** (GraphQL, REST e SOAP), **diferentes frameworks front-end** (React, Angular 19 e AngularJS 1.x), **banco relacional PostgreSQL** e **conteinerização total via Docker**, com **deploy em produção real na Amazon Web Services (AWS)**.

---

## 📑 Sumário

- [📐 Arquitetura Geral do Sistema](#-arquitetura-geral-do-sistema)
- [☁️ Arquitetura de Nuvem (AWS)](#️-arquitetura-de-nuvem-aws)
- [🛠️ Stack Tecnológica & Distribuição de Componentes](#️-stack-tecnológica--distribuição-de-componentes)
- [🔌 Mapeamento de Portas e Endpoints](#-mapeamento-de-portas-e-endpoints)
- [🚀 Microsserviços e Aplicações Detalhadas](#-microsserviços-e-aplicações-detalhadas)
  - [1. Backend GraphQL (`/backend`)](#1-backend-graphql-backend)
  - [2. API RESTful & Cliente AngularJS (`/api-restful`)](#2-api-restful--cliente-angularjs-api-restful)
  - [3. Serviço SOAP & WSDL (`/servico-soap`)](#3-serviço-soap--wsdl-servico-soap)
  - [4. Frontend E-Commerce em React (`/frontend`)](#4-frontend-e-commerce-em-react-frontend)
  - [5. Painel Admin em Angular 19 (`/frontend-angular`)](#5-painel-admin-em-angular-19-frontend-angular)
- [🛡️ Relatório de Segurança e Mitigações](#️-relatório-de-segurança-e-mitigações)
- [⚡ Testador de Performance e Latência](#-testador-de-performance-e-latência)
- [☁️ Guia Completo de Deploy na AWS](#️-guia-completo-de-deploy-na-aws)
- [🚦 Passo a Passo de Execução Local](#-passo-a-passo-de-execução-local)
- [📂 Estrutura Completa de Diretórios](#-estrutura-completa-de-diretórios)

---

## 📐 Arquitetura Geral do Sistema

O sistema é construído segundo o padrão de microsserviços desacoplados e conteinerizados, comunicando-se através de uma rede bridge virtual customizada do Docker (`pizza_network`).

```mermaid
graph TD
    subgraph Clientes [Camada de Apresentação / Front-End]
        ReactApp["📱 React E-Commerce App\n(Vite + Apollo Client)\nPorta 5173"]
        AngularApp["💻 Angular 19 Admin Dashboard\n(Standalone Components)\nPorta 4200"]
        AngularJSApp["🏛️ AngularJS 1.x Embedded Client\n(Integrado na API REST)\nPorta 8000"]
        SOAPClient["⚡ SOAP Client Script\n(Node.js Script CLI)"]
    end

    subgraph Servidores [Camada de Negócio / Back-End Microservices]
        GraphQLAPI["🚀 GraphQL API\n(FastAPI + Ariadne + Python)\nPorta 4000"]
        RESTAPI["⚡ RESTful API\n(Express.js + Helmet + RateLimiter)\nPorta 8000"]
        SOAPAPI["📜 SOAP Calculator API\n(Express.js + WSDL + soap npm)\nPorta 8001"]
    end

    subgraph Persistencia [Camada de Dados]
        PostgresDB[("🐘 PostgreSQL Database\n(Porta Externa 5433 / Interna 5432)")]
    end

    ReactApp -->|GraphQL HTTP POST /queries/mutations| GraphQLAPI
    GraphQLAPI -->|SQL Queries via psycopg2| PostgresDB

    AngularApp -->|HTTP REST JSON /api/pizzas| RESTAPI
    AngularJSApp -->|Direct REST HTTP| RESTAPI

    SOAPClient -->|SOAP XML Payload /soap| SOAPAPI
```

---

## ☁️ Arquitetura de Nuvem (AWS)

O ambiente de produção foi provisionado na nuvem da **Amazon Web Services (AWS)** com a seguinte topologia de infraestrutura:

```mermaid
graph LR
    subgraph Internet [Internet / Usuários]
        UserBrowser[Navegador / Cliente Remoto]
    end

    subgraph AWSCloud [AWS Cloud - Instância EC2]
        subgraph SecurityGroup [Security Group - Firewall Rules]
            direction TB
            SG_SSH["Porta 22: SSH Access"]
            SG_GQL["Porta 4000: GraphQL API"]
            SG_REST["Porta 8000: REST API & AngularJS"]
            SG_SOAP["Porta 8001: SOAP API & WSDL"]
            SG_DB["Porta 5433: PostgreSQL Direct Access"]
        end

        subgraph EC2Instance [Instância EC2 - Amazon Linux 2023 - t3.micro]
            IP["Elastic IP: 13.61.177.99"]
            DockerEngine["Docker Engine & Docker Compose"]
            
            subgraph Containers [Docker Containers Containerized Network]
                C_GQL["pizza_backend (FastAPI)"]
                C_REST["pizza_rest_api (Express)"]
                C_SOAP["calculadora_soap_service (Node)"]
                C_DB["pizza_postgres (Postgres 15)"]
            end
            
            EBSVolume[("EBS Storage Volume\n(20 GiB SSD Persistent Data)")]
        end
    end

    UserBrowser -->|SSH Porta 22| SG_SSH
    UserBrowser -->|HTTP Porta 4000| SG_GQL
    UserBrowser -->|HTTP Porta 8000| SG_REST
    UserBrowser -->|HTTP Porta 8001| SG_SOAP

    SG_SSH --> DockerEngine
    SG_GQL --> C_GQL
    SG_REST --> C_REST
    SG_SOAP --> C_SOAP
    
    C_GQL --> C_DB
    C_DB --- EBSVolume
```

---

## 🛠️ Stack Tecnológica & Distribuição de Componentes

### 1. Front-End (Três Tecnologias Distintas)
- **React (Vite)**: Desenvolvido para a interface pública do cliente (**E-Commerce**). Utiliza **Apollo Client** para comunicação reativa via GraphQL e **Context API** para gerenciamento do carrinho de compras.
- **Angular 19 (Standalone Components)**: Desenvolvido para o **Painel Administrativo da Pizzaria**. Interface moderna e reativa para operações de CRUD de pizzas consumindo a API REST.
- **AngularJS (v1.x)**: Aplicação web legado embutida na pasta `public/` da API RESTful (porta `8000`), demonstrando convivência com aplicações legadas.
- **Vanilla CSS**: Estilização rica com modo escuro, gradientes dinâmicos, glassmorphism e animações suaves em todos os front-ends sem dependências de frameworks CSS externos.

### 2. Back-End (Três Paradigmas Arquiteturais)
- **FastAPI & Ariadne (Python 3.11+)**: Servidor **GraphQL** principal (porta `4000`). Gerencia Usuários, Endereços, Cartões de Crédito, Pedidos e Cardápio com schema estritamente tipado.
- **Express.js (Node.js)**: Servidor da **API RESTful** de Pizzas (porta `8000`), provendo endpoints JSON estruturados com middlewares de segurança.
- **Express.js + `soap` npm**: Servidor **SOAP** (porta `8001`) expondo contrato WSDL (`calculadora.wsdl`) com operações XML de soma e subtração utilizadas no cálculo de fretes e cupons.

### 3. Persistência de Dados & Infraestrutura
- **PostgreSQL 15 Alpine**: Banco de dados relacional que persiste todas as entidades da aplicação com integridade referencial.
- **Docker & Docker Compose**: Isolamento e orquestração de 4 containers em rede bridge (`pizza_network`), garantindo reprodutibilidade total entre dev local e AWS.

---

## 🔌 Mapeamento de Portas e Endpoints

| Serviço / Container | Tecnologia | Porta Host | Porta Container | Descrição / Endpoints Principais |
| :--- | :--- | :---: | :---: | :--- |
| `pizza_backend` | FastAPI (Python) | `4000` | `4000` | GraphQL Endpoint: `http://localhost:4000/graphql` |
| `pizza_rest_api` | Express.js (Node.js) | `8000` | `8000` | REST API: `http://localhost:8000/api/pizzas`<br>Cliente AngularJS: `http://localhost:8000/` |
| `calculadora_soap_service` | Express + WSDL | `8001` | `8001` | WSDL Endpoint: `http://localhost:8001/soap?wsdl` |
| `pizza_postgres` | PostgreSQL 15 | `5433` | `5432` | Database Connection: `postgresql://pizza_user:pizza_pass@localhost:5433/pizza_db` |
| `frontend` | React + Vite | `5173` | Local | E-Commerce Web Client: `http://localhost:5173/` |
| `frontend-angular` | Angular 19 | `4200` | Local | Admin Dashboard: `http://localhost:4200/` |

---

## 🚀 Microsserviços e Aplicações Detalhadas

### 1. Backend GraphQL (`/backend`)
- **Tecnologias**: Python 3.11+, FastAPI, Ariadne (Schema-First GraphQL), `psycopg2-binary`.
- **Funcionalidades**:
  - `schema.graphql`: Define tipos como `Usuario`, `Endereco`, `CartaoCredito`, `Pizza`, `Pedido`, `ItemPedido` e enum `StatusPedido`.
  - Resolvedores em `resolvedores.py` suportando Queries (`obterPizzas`, `obterPizzasAtivas`, `obterPedidos`, etc.) e Mutations (`criarUsuario`, `criarPedido`, `adicionarItemAoPedido`, etc.).
  - `semeador.py`: Script para povoamento automático de dados de demonstração no PostgreSQL.

### 2. API RESTful & Cliente AngularJS (`/api-restful`)
- **Tecnologias**: Node.js, Express.js, Helmet, Express-Rate-Limit, AngularJS 1.x.
- **Endpoints REST**:
  - `GET /api/pizzas`: Lista todas as pizzas cadastradas.
  - `POST /api/pizzas`: Cadastra nova pizza (com sanitização e validação de limite de caracteres).
  - `PUT /api/pizzas/:id`: Atualiza pizza existente.
  - `DELETE /api/pizzas/:id`: Remove pizza por ID.
- **Cliente Embutido**: Servido em `http://localhost:8000/` permitindo visualizar e cadastrar pizzas via interface AngularJS.

### 3. Serviço SOAP & WSDL (`/servico-soap`)
- **Tecnologias**: Node.js, Express.js, `soap` npm library.
- **Contrato WSDL**: `calculadora.wsdl` definindo o serviço `CalculadoraService` e a porta `CalculadoraPort`.
- **Operações**:
  - `Somar`: Recebe `<a` e `<b`, retorna `<resultado`.
  - `Subtrair`: Recebe `<a` e `<b`, retorna `<resultado`.
- **Cliente CLI (`client.js`)**: Script Node.js que realiza chamadas XML para testar o serviço remotamente via linha de comando.

### 4. Frontend E-Commerce em React (`/frontend`)
- **Tecnologias**: React 18, Vite, Apollo Client (`@apollo/client`).
- **Recursos**: Cardápio interativo, filtro por categoria, inclusão no carrinho, seleção de método de pagamento (Cartão/PIX), visualizador de pedidos em tempo real.

### 5. Painel Admin em Angular 19 (`/frontend-angular`)
- **Tecnologias**: Angular 19, TypeScript, RxJS, HttpClientModule.
- **Recursos**: Painel administrativo para cadastro, edição, alteração de preços, ativação/desativação e exclusão de pizzas consumindo a API RESTful.

---

## 🛡️ Relatório de Segurança e Mitigações

A segurança da **API RESTful** foi auditada e endurecida com as seguintes mitigações (documentadas detalhadamente em [`relatorio-seguranca.md`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/relatorio-seguranca.md)):

1. **Proteção contra DoS e Brute Force (Rate Limiting)**:
   - Middleware `express-rate-limit` ativado na rota `/api/`.
   - Limite estrito de **100 requisições a cada 15 minutos por IP**. Resposta HTTP `429 Too Many Requests` ao exceder.
2. **Proteção de Cabeçalhos & Remoção de Identificação de Stack (Helmet)**:
   - Remoção do cabeçalho `X-Powered-By: Express`.
   - Inclusão de cabeçalhos de segurança padrão (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).
3. **Prevenção contra Stored XSS e DoS de Armazenamento**:
   - Função auxiliar `sanitizeInput()` converte caracteres HTML especiais (`<`, `>`, `&`, `"`, `'`) em entidades seguras.
   - Limite de caracteres: `nome` (máx. 50 chars), `ingredientes` (máx. 200 chars) e `preco` (numérico positivo < 1000).

---

## ⚡ Testador de Performance e Latência

O projeto conta com um script automatizado de benchmarking de estresse e latência ([`performance_test.js`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/performance_test.js)):

- **Metodologia**: Executa 50 requisições simultâneas sequenciais com intervalo de 10ms para comparar a resposta dos servidores na AWS.
- **Execução**:
  ```bash
  node performance_test.js
  ```
- **Métricas Analisadas**: Taxa de sucesso (%), Latência Mínima (ms), Latência Máxima (ms) e Latência Média (ms).

---

## ☁️ Guia Completo de Deploy na AWS

O deploy da infraestrutura de back-end foi concluído com sucesso em uma instância **AWS EC2** (Amazon Linux 2023, `t3.micro`) no IP **`13.61.177.99`**.

### Conexão SSH
```powershell
ssh -i "C:\Users\diego\OneDrive\Documentos\Faculdade\pizzaria-chave.pem" ec2-user@13.61.177.99
```

### Comandos de Deploy Executados na EC2
```bash
# 1. Clonar o repositório
git clone https://github.com/Diegoximenes01/Projeto-Pizzaria.git

# 2. Acessar a pasta
cd Projeto-Pizzaria

# 3. Inicializar os microsserviços via Docker
docker-compose up -d
```

### Comandos de Monitoramento para Apresentação
```bash
# Verificar status dos containers ativos
docker ps

# Acompanhar logs unificados em tempo real
docker-compose logs -f --tail=20

# Verificar consumo de memória RAM e Swap
free -h

# Verificar uso de disco EBS
df -h
```

---

## 🚦 Passo a Passo de Execução Local

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando.
- [Node.js (v18+)](https://nodejs.org/) instalado.

---

### Passo 1: Subir os Containers do Back-End & Banco de Dados
Na raiz do projeto, execute:
```bash
docker-compose up -d
```
Verifique o status com:
```bash
docker ps
```
*Deve listar 4 containers ativos: `pizza_backend`, `pizza_rest_api`, `calculadora_soap_service`, e `pizza_postgres`.*

---

### Passo 2: Executar o E-Commerce React
Em um novo terminal:
```bash
cd frontend
npm install
npm run dev
```
Acesse no navegador: **[http://localhost:5173/](http://localhost:5173/)**

---

### Passo 3: Executar o Painel Admin Angular
Em um novo terminal:
```bash
cd frontend-angular
npm install
npm start
```
Acesse no navegador: **[http://localhost:4200/](http://localhost:4200/)**

---

### Passo 4: Executar o Cliente SOAP
Em um novo terminal:
```bash
cd servico-soap
node client.js
```
O console exibirá as respostas das chamadas XML de soma e subtração enviadas ao servidor.

---

### Passo 5: Executar o Teste de Performance
Na raiz do projeto:
```bash
node performance_test.js
```

---

## 📂 Estrutura Completa de Diretórios

```text
Projeto-Pizzaria/
├── api-restful/                  # Microsserviço RESTful (Express.js)
│   ├── public/                   # Cliente Web AngularJS embutido & imagens das pizzas
│   │   ├── index.html            # Interface web AngularJS
│   │   └── ...                   # Imagens assets das pizzas e bebidas
│   ├── Dockerfile                # Dockerfile da API RESTful
│   ├── package.json              # Dependências (Express, Helmet, Rate-Limit)
│   └── server.js                 # Servidor Express, rotas /api/pizzas e sanitização
├── backend/                      # Microsserviço GraphQL (FastAPI & Ariadne)
│   ├── codigo/
│   │   ├── graphql_api/
│   │   │   ├── resolvedores.py   # Query e Mutation resolvers
│   │   │   └── schema.graphql    # Esquema estrito do GraphQL
│   │   ├── banco.py              # Conexão e queries com o PostgreSQL
│   │   ├── principal.py          # Entrypoint da aplicação FastAPI
│   │   └── semeador.py           # População inicial de dados no banco
│   ├── Dockerfile                # Dockerfile do Backend Python
│   └── requirements.txt          # Dependências Python (fastapi, uvicorn, ariadne, psycopg2)
├── deploy-nuvem/                 # Documentação e guias de implantação AWS
│   └── README.md                 # Guia detalhado de deploy (EC2, App Runner, Beanstalk)
├── frontend/                     # Cliente E-Commerce React (Vite + Apollo)
│   ├── codigo/                   # Componentes React, Páginas, Contextos e Apollo Client
│   ├── index.html                # Entrypoint HTML do React
│   ├── package.json              # Dependências React & Apollo
│   └── vite.config.js            # Configuração do Vite (Porta 5173)
├── frontend-angular/             # Painel Administrativo Angular 19
│   ├── src/                      # Componentes Standalone, Serviços HTTP e HTML/CSS
│   ├── angular.json              # Configurações do projeto Angular (Porta 4200)
│   └── package.json              # Dependências Angular 19
├── servico-soap/                 # Microsserviço SOAP da Calculadora (Express + WSDL)
│   ├── calculadora.wsdl          # Contrato de serviço SOAP WSDL
│   ├── client.js                 # Cliente Node.js para consumir o SOAP via XML
│   ├── Dockerfile                # Dockerfile do Serviço SOAP
│   └── server.js                 # Servidor Express + soap npm (Porta 8001)
├── docker-compose.yml            # Orquestração dos 4 containers Docker na pizza_network
├── performance_test.js           # Benchmark de estresse e latência (50 execuções)
├── README.md                     # Documentação principal do projeto
└── relatorio-seguranca.md        # Relatório de auditoria e correções de segurança
```

---

## 👥 Autor

- **Diego Ximenes** - [*@Diegoximenes01*](https://github.com/Diegoximenes01)
- Projeto desenvolvido para a cadeira de **Computação em Nuvem**.
