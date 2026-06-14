const http = require('http');

const CONFIG = {
  runs: 50,
  endpoints: [
    { name: 'REST API (Listar Pizzas)', url: 'http://localhost:8000/api/pizzas', method: 'GET' },
    { name: 'SOAP API (Obter WSDL)', url: 'http://localhost:8001/soap?wsdl', method: 'GET' }
  ]
};

function makeRequest(url, method) {
  return new Promise((resolve) => {
    const start = process.hrtime();
    const req = http.request(url, { method }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const diff = process.hrtime(start);
        const ms = (diff[0] * 1000) + (diff[1] / 1000000);
        resolve({ success: res.statusCode >= 200 && res.statusCode < 400, ms, statusCode: res.statusCode });
      });
    });

    req.on('error', (err) => {
      const diff = process.hrtime(start);
      const ms = (diff[0] * 1000) + (diff[1] / 1000000);
      resolve({ success: false, ms, error: err.message });
    });

    req.end();
  });
}

async function runBenchmarkForEndpoint(endpoint) {
  console.log(`🚀 Iniciando teste para: ${endpoint.name} (${endpoint.url})...`);
  const latencies = [];
  let successCount = 0;

  for (let i = 0; i < CONFIG.runs; i++) {
    const res = await makeRequest(endpoint.url, endpoint.method);
    if (res.success) {
      successCount++;
      latencies.push(res.ms);
    }
    // Pequena pausa entre requisições para simular tráfego real
    await new Promise(r => setTimeout(r, 10));
  }

  if (latencies.length === 0) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      successRate: '0%',
      min: 'N/A',
      max: 'N/A',
      avg: 'N/A'
    };
  }

  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  return {
    name: endpoint.name,
    url: endpoint.url,
    successRate: `${((successCount / CONFIG.runs) * 100).toFixed(1)}%`,
    min: `${min.toFixed(2)} ms`,
    max: `${max.toFixed(2)} ms`,
    avg: `${avg.toFixed(2)} ms`
  };
}

async function main() {
  console.log('====================================================');
  console.log(`⚡ TESTADOR DE PERFORMANCE DE API - ${CONFIG.runs} EXECUÇÕES`);
  console.log('====================================================\n');

  const results = [];
  for (const endpoint of CONFIG.endpoints) {
    const result = await runBenchmarkForEndpoint(endpoint);
    results.push(result);
    console.log(`✅ Concluído.`);
  }

  console.log('\n====================================================');
  console.log('📊 RESULTADOS DO TESTE DE LATÊNCIA');
  console.log('====================================================');
  console.table(results.map(r => ({
    'Nome da API': r.name,
    'Taxa de Sucesso': r.successRate,
    'Mínimo': r.min,
    'Máximo': r.max,
    'Média': r.avg
  })));
  console.log('====================================================\n');
}

main().catch(console.error);
