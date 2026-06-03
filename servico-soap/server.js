const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;

// Objeto que implementa as operações definidas no WSDL
const serviceObject = {
  CalculadoraService: {
    CalculadoraPort: {
      Somar: function(args) {
        console.log(`[SOAP Somar] Recebido: a = ${args.a}, b = ${args.b}`);
        const a = parseFloat(args.a);
        const b = parseFloat(args.b);
        return { resultado: a + b };
      },
      Subtrair: function(args) {
        console.log(`[SOAP Subtrair] Recebido: a = ${args.a}, b = ${args.b}`);
        const a = parseFloat(args.a);
        const b = parseFloat(args.b);
        return { resultado: a - b };
      }
    }
  }
};

// Ler o arquivo WSDL
const wsdlXml = fs.readFileSync(path.join(__dirname, 'calculadora.wsdl'), 'utf8');

// Rota de status/informações no navegador
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Furreti SOAP Server 🚀</title>
        <style>
          body { font-family: sans-serif; background-color: #0f0c1b; color: #f3f1f6; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: rgba(30, 25, 50, 0.6); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255, 94, 58, 0.2); text-align: center; }
          a { color: #ffb834; font-weight: bold; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Servidor SOAP Ativo! 🚀</h1>
          <p>O arquivo de definição de serviço WSDL está disponível em:</p>
          <p><a href="/soap?wsdl" target="_blank">http://localhost:${PORT}/soap?wsdl</a></p>
          <p style="color: #a09cb0; font-size: 0.9rem; margin-top: 1.5rem;">Use o script <code>client.js</code> para fazer requisições.</p>
        </div>
      </body>
    </html>
  `);
});

// Iniciar o servidor HTTP Express
app.listen(PORT, '0.0.0.0', () => {
  // Configurar a escuta do SOAP na rota /soap
  soap.listen(app, '/soap', serviceObject, wsdlXml, function() {
    console.log(`🚀 Servidor SOAP rodando em http://localhost:${PORT}/soap?wsdl`);
  });
});
