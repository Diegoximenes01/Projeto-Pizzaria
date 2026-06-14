# 🛡️ Relatório de Identificação e Correção de Vulnerabilidades

Este documento detalha as vulnerabilidades de segurança identificadas na API RESTful de Pizzas (`api-restful`) do projeto e as respectivas mitigações aplicadas em nível de código.

---

## 1. Vulnerabilidade: Negação de Serviço (DoS) e Brute Force por Falta de Rate Limiting
*   **Identificação:** A API não possuía qualquer limite para a quantidade de requisições enviadas por um único cliente/IP. Um atacante poderia facilmente criar um script simples para inundar a API com milhares de requisições de cadastros ou exclusões por segundo, travando a aplicação ou estourando o consumo de recursos (memória/CPU) da infraestrutura local ou na nuvem.
*   **Mitigação Aplicada:** Instalado e configurado o middleware `express-rate-limit` na rota base `/api/`. Agora, cada IP é limitado a no máximo **100 requisições a cada 15 minutos**. Caso o limite seja excedido, a API bloqueia o IP temporariamente e responde com o status HTTP `429 Too Many Requests`.

---

## 2. Vulnerabilidade: Exposição de Informações Sensíveis e Ausência de Cabeçalhos de Segurança (XSS, Clickjacking)
*   **Identificação:** 
    1.  O servidor Express enviava por padrão o cabeçalho `X-Powered-By: Express`, facilitando para um atacante identificar a stack tecnológica e buscar exploits direcionados para versões específicas do Express/Node.js.
    2.  Ausência de cabeçalhos de segurança essenciais como `Content-Security-Policy` (CSP), `X-Frame-Options` e `X-Content-Type-Options`, deixando a aplicação vulnerável a ataques de Clickjacking, roubo de sessões e ataques de injeção de MIME.
*   **Mitigação Aplicada:** Instalado e integrado o middleware `helmet` que gerencia e adiciona cabeçalhos HTTP seguros por padrão (e remove o `X-Powered-By`). Como o cliente REST usa estilos e scripts embutidos na própria página HTML (`index.html`), a Content Security Policy (CSP) foi ajustada para permitir `'unsafe-inline'` para estilos e scripts, além de permitir fontes externas do Google Fonts (`fonts.googleapis.com` e `fonts.gstatic.com`).

---

## 3. Vulnerabilidade: Falta de Validação de Tamanho e Sanitização de Entradas (Stored XSS / DoS de Armazenamento)
*   **Identificação:**
    1.  Os endpoints `POST` e `PUT` aceitavam strings de qualquer tamanho para os campos `nome` e `ingredientes`. Um atacante poderia enviar payloads gigantescos (megabytes de texto) travando a memória do servidor.
    2.  O texto enviado não era sanitizado antes de ser armazenado no banco de dados em memória. Se um usuário cadastrasse uma pizza com o nome `<script>alert('hackeado')</script>`, esse script seria executado no navegador de qualquer outro usuário ao carregar a página do cardápio (Stored Cross-Site Scripting).
*   **Mitigação Aplicada:**
    1.  Inseridas validações rigorosas de tipo e tamanho nos endpoints `POST` e `PUT`. O campo `nome` agora é limitado a **50 caracteres**, `ingredientes` a **200 caracteres**, e o `preco` deve ser obrigatoriamente um número positivo menor que **1000** (evitando estouro de float/precisão decimal).
    2.  Criada e aplicada a função auxiliar `sanitizeInput()` que substitui caracteres HTML especiais (`<`, `>`, `&`, `"`, `'`) por suas respectivas entidades HTML seguras. Dessa forma, qualquer tentativa de injeção de scripts é renderizada apenas como texto inofensivo na interface do cliente.
