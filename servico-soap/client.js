const soap = require('soap');
const url = 'http://13.61.177.99:8001/soap?wsdl';

console.log('====================================================');
console.log('🔌 Conectando ao cliente SOAP em:');
console.log(url);
console.log('====================================================\n');

// Criar o cliente baseado no WSDL
soap.createClient(url, function(err, client) {
  if (err) {
    console.error('❌ Erro crítico ao conectar ao serviço SOAP:', err.message);
    console.error('Certifique-se de que o servidor (server.js) está rodando na porta 8001.');
    return;
  }

  console.log('✅ Cliente SOAP conectado com sucesso!');
  
  // Sobrescreve o endpoint definido no WSDL (que está fixado como localhost)
  // para usar o mesmo servidor de onde baixamos o WSDL
  const endpoint = url.replace('?wsdl', '');
  client.setEndpoint(endpoint);
  
  // Chamada 1: Somar(35.5, 12.5)
  const argsSomar = { a: 35.5, b: 12.5 };
  console.log(`\n📤 Enviando requisição SOAP [Somar]: a = ${argsSomar.a}, b = ${argsSomar.b}...`);
  
  client.Somar(argsSomar, function(err, result) {
    if (err) {
      console.error('❌ Erro na operação Somar:', err);
    } else {
      console.log(`📥 Resposta SOAP [Somar]: resultado = ${result.resultado}`);
      console.log(`✨ Sucesso: ${argsSomar.a} + ${argsSomar.b} = ${result.resultado}`);
    }

    // Chamada 2: Subtrair(100, 42.5)
    const argsSubtrair = { a: 100, b: 42.5 };
    console.log(`\n📤 Enviando requisição SOAP [Subtrair]: a = ${argsSubtrair.a}, b = ${argsSubtrair.b}...`);

    client.Subtrair(argsSubtrair, function(err, result) {
      if (err) {
        console.error('❌ Erro na operação Subtrair:', err);
      } else {
        console.log(`📥 Resposta SOAP [Subtrair]: resultado = ${result.resultado}`);
        console.log(`✨ Sucesso: ${argsSubtrair.a} - ${argsSubtrair.b} = ${result.resultado}`);
      }
      console.log('\n====================================================');
    });
  });
});
