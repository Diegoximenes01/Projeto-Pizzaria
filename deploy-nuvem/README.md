# Guia de Deploy na AWS (Amazon Web Services) ☁️

Este guia explica como hospedar e rodar tanto a sua **API RESTful de Pizzas** quanto o seu **Serviço SOAP de Calculadora** na infraestrutura de nuvem da AWS.

Como ambos os serviços são aplicações web baseadas em **Node.js**, o processo de deploy na AWS é muito semelhante para ambos. Apresentamos abaixo como configurar e implantar cada um deles.

---

## 🚀 Opção A: AWS App Runner (Recomendado)

O AWS App Runner conecta-se diretamente ao seu repositório do GitHub e reconstrói/atualiza a aplicação automaticamente toda vez que você faz um `git push`. É o serviço PaaS mais moderno e simples da AWS.

### Passo 1: Preparar os Repositórios no GitHub
Recomendamos criar repositórios separados para cada serviço ou usar um único repositório mono-repo (com subpastas).
1. Crie um repositório no seu GitHub para a API REST (ex: `pizza-rest-api`) e outro para o SOAP (ex: `calculadora-soap`).
2. Adicione os arquivos correspondentes a cada repositório.
   *(Certifique-se de que a pasta `node_modules` está no seu `.gitignore` e não foi enviada!)*
3. Faça o push dos arquivos para a branch principal (`main`).

### Passo 2: Configurar o Serviço REST na AWS App Runner
1. Acesse o Console da AWS e pesquise por **AWS App Runner**.
2. Clique em **Create service**.
3. Escolha **Source code repository**, conecte sua conta do GitHub e selecione o repositório da API REST.
4. Em **Deployment settings**, escolha **Automatic**.
5. Em **Configure build**:
   - **Runtime**: `Nodejs 18` (ou superior)
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Port**: `8000` (Porta configurada em `api-restful/server.js`)
6. Dê um nome ao serviço (ex: `pizza-rest-service`) e clique em **Create & deploy**.

### Passo 3: Configurar o Serviço SOAP na AWS App Runner
Repita os mesmos passos acima, mas com as seguintes alterações:
1. Conecte ao repositório do **Serviço SOAP**.
2. Em **Configure build**:
   - **Runtime**: `Nodejs 18`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Port**: `8001` (Porta padrão configurada em `servico-soap/server.js`)
3. Dê um nome ao serviço (ex: `calculadora-soap-service`) e clique em **Create & deploy**.

---

## 📦 Opção B: AWS Elastic Beanstalk (Upload de ZIP)

O Elastic Beanstalk gerencia automaticamente o provisionamento, balanceamento de carga, escalabilidade e monitoramento de integridade usando instâncias EC2.

### Passo 1: Criar o arquivo ZIP da Aplicação
Selecione os arquivos correspondentes (do REST ou do SOAP) e comprima em formato ZIP.
> ⚠️ **IMPORTANTE:** Não inclua a pasta `node_modules` no ZIP! O arquivo zip deve conter diretamente na raiz:
> - Para REST: `server.js`, `package.json` e a pasta `/public`.
> - Para SOAP: `server.js`, `package.json` e `calculadora.wsdl`.

### Passo 2: Criar a Aplicação no Elastic Beanstalk
1. Acesse o Console da AWS e pesquise por **Elastic Beanstalk**.
2. Clique em **Create application**.
3. **Application name**: `pizza-rest-api` ou `calculadora-soap`.
4. **Platform**: Selecione `Node.js` (ex: `Node.js 18 running on 64bit Amazon Linux 2023`).
5. Em **Application code**:
   - Selecione **Upload your code** e envie o arquivo `.zip` correspondente criado no Passo 1.
6. Clique em **Next** ou **Skip to review** para implantar com configurações padrão de teste (geralmente uma única instância EC2 do tipo `t3.micro`, ideal para testes universitários).

---

## 🔗 Como Consumir o Serviço SOAP na Nuvem
Quando o serviço SOAP estiver hospedado na AWS (ex: via App Runner), ele terá uma URL pública como `https://xxxxxx.us-east-1.awsapprunner.com`. 

Para que seu script cliente (`client.js`) consuma o serviço na AWS em vez de localmente, basta alterar a variável `url` no início do arquivo:

```javascript
// Substitua o localhost pela URL pública fornecida pela AWS:
const url = 'https://xxxxxx.us-east-1.awsapprunner.com/soap?wsdl';
```
Isso fará com que o cliente envie mensagens SOAP/XML pela internet para o servidor hospedado na nuvem AWS, efetuando as operações remotamente!
