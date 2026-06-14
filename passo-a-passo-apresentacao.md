# 🎓 Guia de Apresentação da Página Principal - Furreti Cucina

Este guia é um roteiro detalhado para você apresentar a **Página Principal de E-Commerce (React)** ao professor. Ele foca exatamente no fluxo de compras do site e explica o que acontece no back-end e no banco de dados a cada clique.

---

## 🚀 Como Inicializar o Projeto para a Apresentação

Abra três terminais separados e execute os comandos abaixo na ordem:

1.  **Inicializar o Back-end completo & Banco de Dados (Docker Compose)**:
    ```bash
    docker-compose up -d
    ```
2.  **Inicializar o Front-end Principal (React)**:
    ```bash
    cd frontend
    npm run dev
    ```
    *Isso abrirá a aplicação em: **[http://localhost:5173](http://localhost:5173)***
3.  **Inicializar o Front-end Auxiliar (Angular - se o professor pedir para ver)**:
    ```bash
    cd frontend-angular
    npm start
    ```
    *Isso abrirá o Painel Administrativo em: **[http://localhost:4200](http://localhost:4200)***

---

## 📋 Passo a Passo do Fluxo de Apresentação da Página Principal

Abra o navegador no site principal ([http://localhost:5173](http://localhost:5173)) e siga o roteiro abaixo explicando cada detalhe para o professor:

### Passo 1: O Cardápio (Carregamento Dinâmico)
*   **O que fazer**: Navegue pelas abas "Pizzas Tradicionais", "Pizzas Especiais" e "Bebidas". Clique em uma pizza para abrir o modal de detalhes e adicione 1 ou mais unidades ao carrinho.
*   **O que explicar para o professor**:
    > *"Ao carregar esta página inicial, o React faz uma query GraphQL (`GetPizzas`) enviada para o nosso servidor GraphQL (Python/FastAPI) na porta 4000. O back-end busca esses dados em tempo real no banco PostgreSQL e retorna o JSON. O gerenciamento de estado do carrinho é feito localmente usando a Context API do React para garantir velocidade."*

### Passo 2: O Carrinho & A Autenticação
*   **O que fazer**: Clique no ícone do carrinho no cabeçalho. Mostre que o carrinho lista os itens e calcula o total. Clique em **"Entrar para Finalizar"**. Na tela de autenticação, simule a criação de uma conta clicando em **"Cadastre-se"**. Preencha o Nome, CPF, E-mail, Telefone, Senha e confirme.
*   **O que explicar para o professor**:
    > *"Para fazer uma compra, o usuário precisa estar logado. Na tela de cadastro, fazemos validações no front-end (como formatação de CPF e máscara de telefone). Ao clicar em 'Cadastrar', o React dispara uma Mutation GraphQL (`cadastrarUsuario`) que insere o novo registro diretamente na tabela 'Usuario' do PostgreSQL no container Docker."*

### Passo 3: Opções de Logística (Entrega / Retirada)
*   **O que fazer**: Após o cadastro, você será redirecionado para a tela de Entrega.
    1.  Selecione **"Entrega em Domicílio"**: digite um CEP fictício (como `50000-000`). Mostre que a taxa de entrega de R$ 7,00 é somada ao total.
    2.  Selecione **"Retirada no Balcão"**: mostre que o endereço da pizzaria é carregado e a taxa de entrega zera.
*   **O que explicar para o professor**:
    > *"Esta etapa gerencia o tipo de frete e armazena os endereços do cliente na tabela do banco PostgreSQL. O cálculo da taxa é feito de forma dinâmica e persistido no estado local do Context."*

### Passo 4: Simulação de Pagamento (Segurança & Lógica)
*   **O que fazer**: Clique em **"Ir para o Pagamento"**. Mostre as 3 modalidades disponíveis:
    1.  **Dinheiro**: Marque a caixa *"Preciso de troco"*, digite um valor maior que o total (ex: R$ 100) e mostre que o sistema calcula o troco automaticamente em tempo real.
    2.  **Pix**: Mostre o QR Code gerado de forma dinâmica para simular o pagamento online.
    3.  **Cartão**: Preencha dados fictícios de cartão (16 dígitos, data de validade, nome e CVV). Explique que, ao fechar o pedido com um cartão novo, o sistema o salva de forma segura.
*   **O que explicar para o professor**:
    > *"Se o cliente escolher dinheiro, a aplicação calcula o troco localmente e envia a informação `trocoPara` para o banco. Se pagar com cartão de crédito online, o React dispara a mutation `salvarCartao` que guarda apenas a bandeira e os últimos 4 dígitos do cartão no perfil do usuário no PostgreSQL (por questões de segurança e conformidade com a LGPD)."*

### Passo 5: Sucesso e Persistência
*   **O que fazer**: Clique em **"Confirmar Pedido"**. O site redirecionará para a tela de Sucesso mostrando o tempo de entrega estimado.
*   **O que explicar para o professor**:
    > *"Ao clicar em 'Confirmar Pedido', o React envia a mutation `criarPedido` contendo o ID do usuário, o array com as pizzas e quantidades, e o método de pagamento. No back-end (Python), o servidor valida os preços diretamente no banco PostgreSQL para evitar fraudes no valor total, gera o pedido com UUID e grava nas tabelas 'Pedido' e 'PedidoItem'."*

---

## 💬 Perguntas do Professor & Como Responder

### ❓ *"Por que vocês escolheram usar React no front-end e Python (FastAPI/Ariadne) no back-end?"*
> **Como responder:**
> *"Escolhemos o **React** no front-end por ser uma biblioteca muito consolidada, rápida e que possui a biblioteca **Apollo Client**, o que simplificou o consumo do GraphQL. No back-end, optamos por **Python com FastAPI e Ariadne** simplesmente **por achar mais tranquilo e prático de programar**. O Python tem uma sintaxe muito amigável para manipulação de banco de dados e o FastAPI nos entregou uma performance excelente com pouquíssimo código."*

### ❓ *"Como as partes se conectam de fato?"*
> **Como responder:**
> *"A conexão é feita 100% via rede virtual do Docker. No `docker-compose.yml`, definimos uma rede chamada `pizza_network`. O backend se conecta ao PostgreSQL pela porta interna `5432` usando o driver nativo `psycopg2`. O front-end em React se conecta ao backend Python enviando requisições HTTP POST para `http://localhost:4000/graphql`. Todo o tráfego do GraphQL utiliza queries e mutations encapsuladas dentro do body dessas requisições HTTP."*

### ❓ *"E como funciona a API RESTful e a interoperabilidade com o Angular?"*
> **Como responder:**
> *"O Angular consome a API RESTful construída em Node.js (porta 8000) de forma independente. Quando cadastramos, atualizamos ou deletamos uma pizza através do formulário do painel Angular (porta 4200), o Angular dispara requisições HTTP REST (GET, POST, PUT, DELETE) e a API Node.js atualiza o cardápio em memória instantaneamente. Isso demonstra que nosso ecossistema suporta múltiplos protocolos (REST, SOAP e GraphQL) e múltiplos frameworks cliente de forma interoperável."*
