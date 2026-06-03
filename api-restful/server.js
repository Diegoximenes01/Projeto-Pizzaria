const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend embutido
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória inicial
let pizzas = [
  { id: 1, nome: "Margherita", preco: 32.90, ingredientes: "Molho de tomate, mussarela, manjericão fresco, azeite" },
  { id: 2, nome: "Calabresa", preco: 34.90, ingredientes: "Molho de tomate, mussarela, calabresa fatiada, cebola, orégano" },
  { id: 3, nome: "Frango com Catupiry", preco: 38.90, ingredientes: "Molho de tomate, mussarela, frango desfiado, catupiry, orégano" },
  { id: 4, nome: "Quatro Queijos", preco: 41.90, ingredientes: "Molho de tomate, mussarela, provolone, parmesão, gorgonzola" }
];
let nextId = 5;

// Rota padrão para verificar status da API
app.get('/health', (req, res) => {
  res.json({ status: "ok", message: "API RESTful de Pizzas rodando com sucesso!" });
});

// GET /api/pizzas - Listar todas as pizzas
app.get('/api/pizzas', (req, res) => {
  res.json(pizzas);
});

// GET /api/pizzas/:id - Obter uma pizza específica
app.get('/api/pizzas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pizza = pizzas.find(p => p.id === id);
  if (!pizza) {
    return res.status(404).json({ erro: "Pizza não encontrada." });
  }
  res.json(pizza);
});

// POST /api/pizzas - Criar uma nova pizza
app.post('/api/pizzas', (req, res) => {
  const { nome, preco, ingredientes } = req.body;

  // Validações básicas
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: "O nome da pizza é obrigatório." });
  }
  if (preco === undefined || isNaN(Number(preco)) || Number(preco) <= 0) {
    return res.status(400).json({ erro: "O preço deve ser um número maior que zero." });
  }

  const novaPizza = {
    id: nextId++,
    nome: nome.trim(),
    preco: parseFloat(preco),
    ingredientes: ingredientes ? ingredientes.trim() : ""
  };

  pizzas.push(novaPizza);
  res.status(201).json(novaPizza);
});

// PUT /api/pizzas/:id - Atualizar uma pizza existente
app.put('/api/pizzas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, preco, ingredientes } = req.body;

  const pizzaIndex = pizzas.findIndex(p => p.id === id);
  if (pizzaIndex === -1) {
    return res.status(404).json({ erro: "Pizza não encontrada para atualização." });
  }

  // Validações básicas se os campos forem fornecidos
  if (nome !== undefined && (!nome || typeof nome !== 'string' || nome.trim() === '')) {
    return res.status(400).json({ erro: "O nome da pizza não pode ser vazio." });
  }
  if (preco !== undefined && (isNaN(Number(preco)) || Number(preco) <= 0)) {
    return res.status(400).json({ erro: "O preço deve ser um número maior que zero." });
  }

  const pizzaAtual = pizzas[pizzaIndex];
  
  pizzas[pizzaIndex] = {
    ...pizzaAtual,
    nome: nome !== undefined ? nome.trim() : pizzaAtual.nome,
    preco: preco !== undefined ? parseFloat(preco) : pizzaAtual.preco,
    ingredientes: ingredientes !== undefined ? ingredientes.trim() : pizzaAtual.ingredientes
  };

  res.json(pizzas[pizzaIndex]);
});

// DELETE /api/pizzas/:id - Excluir uma pizza
app.delete('/api/pizzas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pizzaIndex = pizzas.findIndex(p => p.id === id);
  
  if (pizzaIndex === -1) {
    return res.status(404).json({ erro: "Pizza não encontrada para exclusão." });
  }

  const pizzaRemovida = pizzas.splice(pizzaIndex, 1)[0];
  res.json({ mensagem: "Pizza excluída com sucesso!", pizza: pizzaRemovida });
});

// Rota catch-all para servir o HTML principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`REST API local: http://localhost:${PORT}/api/pizzas`);
  console.log(`Interface Web: http://localhost:${PORT}`);
});
