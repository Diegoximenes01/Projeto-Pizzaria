# 🍕 Furreti Cucina - Ecossistema Full-Stack de Pizzaria

Este é um projeto acadêmico completo desenvolvido para a cadeira de **Computação em Nuvem**. O ecossistema simula um fluxo de ponta a ponta (end-to-end) para uma pizzaria moderna, combinando múltiplos padrões arquiteturais de comunicação de dados (**GraphQL, REST e SOAP**) e múltiplos frameworks front-end (**React e Angular**), todos conteinerizados em **Docker**.

---

## 📐 Arquitetura do Sistema

O projeto é estruturado em microsserviços e aplicações independentes que se comunicam através de uma rede bridge virtual do Docker:

```mermaid
graph TD
    subgraph Clientes (Front-End)
        ReactApp["💻 React Client App (Port 5173)"]
        AngularApp["⚙️ Angular Admin Dashboard (Port 4200)"]
        SOAPClient["🔌 SOAP Client (Node.js Script)"]
    end

    subgraph Servidores (Back-End)
        GraphQLAPI["🐍 GraphQL API - FastAPI (Port 4000)"]
        RESTAPI["⚡ REST API - Express.js (Port 8000)"]
        SOAPAPI["🧼 SOAP API - Express + WSDL (Port 8001)"]
    end

    subgraph Persistência
        PostgresDB[("🐘 PostgreSQL (Port 5433 / Interno 5432)")]
    end

    ReactApp -->|GraphQL HTTP POST| GraphQLAPI
    GraphQLAPI -->|psycopg2 SQL Queries| PostgresDB
    
    AngularApp -->|HTTP GET/POST/PUT/DELETE| RESTAPI
    SOAPClient -->|SOAP XML HTTP POST| SOAPAPI
```

---

## 🛠️ Stack Tecnológica

### 1. Front-End
*   **React (Vite)**: Utilizado para a interface de e-commerce do cliente, com Context API para controle do estado do carrinho e navegação por rotas de compra.
*   **Angular 19 (Standalone & Minimal)**: Utilizado para o painel de administração e gerenciamento do catálogo de pizzas via requisições RESTful.
*   **Apollo Client**: Comunicação reativa e cache de dados com o servidor GraphQL.
*   **Vanilla CSS**: Estilização rica, responsiva e performática, focada em uma estética premium de cores escuras e douradas.

### 2. Back-End
*   **FastAPI & Ariadne (Python)**: Back-end principal que expõe o servidor GraphQL schema-first para o fluxo transacional (criação de usuários e pedidos).
*   **Express.js (Node.js)**: Utilizado para construir tanto a API RESTful quanto o servidor SOAP de forma performática.
*   **soap (npm package)**: Implementação e disponibilização de contratos WSDL.
*   **psycopg2-binary**: Comunicação e queries SQL nativas com o banco relacional.

### 3. Banco de Dados & Infraestrutura
*   **PostgreSQL**: Banco de dados relacional oficial que persiste dados de usuários, cartões e pedidos.
*   **Docker & Docker Compose**: Containerização isolada de todos os serviços locais, garantindo consistência ambiental.
*   **AWS App Runner / Elastic Beanstalk**: Modelos documentados para implantação automatizada na nuvem.

---

## 📂 Estrutura de Diretórios

*   [`/backend`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/backend): API GraphQL em Python, arquivos de esquema e scripts de semeadura do banco de dados.
*   [`/api-restful`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/api-restful): API REST em Express para gerenciamento de pizzas e seu respectivo cliente web embutido.
*   [`/servico-soap`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/servico-soap): Serviço SOAP de calculadora e script cliente para chamadas XML.
*   [`/frontend`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/frontend): Aplicação React do e-commerce do cliente.
*   [`/frontend-angular`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/frontend-angular): Painel do administrador em Angular para CRUD de pizzas.
*   [`/deploy-nuvem`](file:///c:/Users/diego/OneDrive/Documentos/Faculdade/Cadeira%20Nuvem/deploy-nuvem): Instruções passo a passo de deploy e infraestrutura na nuvem AWS.

---

## 🚦 Passo a Passo para Execução do Projeto

### Pré-requisitos
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando.
*   [Node.js (versão 18+)](https://nodejs.org/) instalado para executar os front-ends localmente.

---

### Passo 1: Subir a Infraestrutura Geral (Back-End + PostgreSQL)
Abra um terminal na raiz do projeto e execute:
```bash
docker-compose up -d
```
*Este comando baixa a imagem do Postgres, compila os Dockerfiles dos servidores Node e Python, e ativa todos os containers na rede bridge interna.*

Para verificar se tudo subiu corretamente:
```bash
docker ps
```
Você verá 4 containers rodando (`pizza_backend`, `pizza_rest_api`, `calculadora_soap_service`, `pizza_postgres`).

---

### Passo 2: Executar o E-Commerce Principal (React)
Abra um novo terminal na pasta `/frontend` e execute:
```bash
cd frontend
npm install
npm run dev
```
O site do cliente estará disponível em: **[http://localhost:5173/](http://localhost:5173/)**

---

### Passo 3: Executar o Painel de Administração (Angular)
Abra um novo terminal na pasta `/frontend-angular` e execute:
```bash
cd frontend-angular
npm install
npm start
```
O painel do administrador estará disponível em: **[http://localhost:4200/](http://localhost:4200/)**

---

### Passo 4: Executar os Testes do Serviço SOAP
O serviço SOAP roda no Docker na porta `8001`. Para realizar chamadas diretas de soma/subtração utilizando o cliente Node.js:
1. Abra um terminal na pasta `/servico-soap`.
2. Instale as dependências locais se necessário e execute:
   ```bash
   node client.js
   ```
O terminal fará a conversão XML SOAP de ida e volta e imprimirá os resultados da calculadora remota.

---

### Passo 5: Executar Teste de Performance e Latência
Existe um testador de estresse e latência na raiz do projeto. Ele dispara 50 requisições simultâneas para as APIs para comparar o tempo de resposta:
```bash
node performance_test.js
```
O resultado será exibido em uma tabela comparativa organizada no console.

---

## 🛡️ Decisões Arquiteturais & Segurança
*   **Interoperabilidade de Tecnologias**: O uso de GraphQL em Python no app principal e REST/SOAP em Node.js nos demais simula o ambiente real de grandes corporações que herdaram ou integram microsserviços legados.
*   **Segurança de Borda na API REST**:
    *   **Helmet**: Adiciona cabeçalhos contra ataques XSS e Clickjacking.
    *   **Rate Limiter**: Limita acessos repetidos por IP (máximo de 100 requisições/15min) prevenindo sobrecarga e força bruta.
    *   **Sanitização de Payload**: Tratamento rigoroso de caracteres HTML para impedir injeção persistente de scripts maliciosos (Stored XSS).
