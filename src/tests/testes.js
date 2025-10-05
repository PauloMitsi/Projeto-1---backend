const http = require('http');
const url = require('url');
const { connectToDatabase } = require('../config/database');
const { indexarPagina, realizarBusca } = require('../controllers/searchController');

const PORT = 3000;
let server; // Declarado aqui para ser acessível na função de desligamento

// --- DADOS DE TESTE ---
const sitesParaCadastrar = [
    {
        url: 'https://www.mongodb.com/',
        titulo: 'MongoDB',
        descricao: 'MongoDB é um banco de dados NoSQL orientado a documentos.',
        palavrasChave: ['mongodb', 'database', 'nosql', 'documento', 'big data']
    },
    {
        url: 'https://nodejs.org/pt-br/',
        titulo: 'Node.js',
        descricao: 'Node.js® é um ambiente de execução JavaScript construído no motor V8 do Chrome.',
        palavrasChave: ['nodejs', 'javascript', 'runtime', 'backend', 'v8']
    },
    {
        url: 'https://www.typescriptlang.org/',
        titulo: 'TypeScript',
        descricao: 'TypeScript é JavaScript com sintaxe para tipos.',
        palavrasChave: ['typescript', 'javascript', 'tipos', 'compilador', 'frontend']
    },
    {
        url: 'https://developer.mozilla.org/pt-BR/',
        titulo: 'MDN Web Docs',
        descricao: 'Recursos para desenvolvedores, por desenvolvedores. Documentando tecnologias web, incluindo CSS, HTML e JavaScript.',
        palavrasChave: ['mdn', 'javascript', 'html', 'css', 'web api']
    },
    {
        url: 'https://react.dev/',
        titulo: 'React',
        descricao: 'A biblioteca para interfaces de usuário web e nativas.',
        palavrasChave: ['react', 'javascript', 'frontend', 'biblioteca', 'ui']
    },
    {
        url: 'https://www.docker.com/',
        titulo: 'Docker',
        descricao: 'Docker simplifica o desenvolvimento e a implantação de aplicações em contêineres leves e portáteis.',
        palavrasChave: ['docker', 'container', 'devops', 'deploy', 'microserviços']
    },
    {
        url: 'https://www.postman.com/',
        titulo: 'Postman',
        descricao: 'Postman é uma plataforma de API para construir e usar APIs.',
        palavrasChave: ['postman', 'api', 'testes', 'desenvolvimento', 'http']
    },
    {
        url: 'https://git-scm.com/',
        titulo: 'Git',
        descricao: 'Git é um sistema de controle de versão distribuído, gratuito e de código aberto.',
        palavrasChave: ['git', 'controle de versão', 'scm', 'código fonte', 'devops']
    },
    {
        url: 'https://www.utfpr.edu.br/',
        titulo: 'UTFPR',
        descricao: 'Universidade Tecnológica Federal do Paraná. A primeira universidade tecnológica do Brasil.',
        palavrasChave: ['utfpr', 'universidade', 'tecnologia', 'parana', 'brasil']
    },
    {
        url: 'https://github.com/',
        titulo: 'GitHub',
        descricao: 'GitHub é onde mais de 100 milhões de desenvolvedores moldam o futuro do software, juntos.',
        palavrasChave: ['github', 'git', 'colaboração', 'código fonte', 'devops']
    }
];

async function iniciarAplicacao() {
  try {
    await connectToDatabase();
    server = http.createServer(async (req, res) => {
      // Configuração do servidor (roteamento)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname;
      if (pathname === '/api/index' && req.method === 'POST') {
        await indexarPagina(req, res);
      } else if (pathname === '/api/search' && req.method === 'GET') {
        await realizarBusca(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sucesso: false, mensagem: 'Rota não encontrada.' }));
      }
    });
    server.listen(PORT, () => {
      console.log(`--- Servidor de teste rodando em http://localhost:${PORT} ---`);
      executarTestes();
    });
  } catch (error) {
    console.error("Falha ao iniciar a aplicação.", error);
    process.exit(1);
  }
}

function fazerRequisicao(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
            resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function executarTestes() {
  console.log('\n--- INICIANDO SUÍTE DE TESTES AUTOMATIZADOS ---\n');
  try {
    // --- Teste 1: Indexar todos os 10 sites ---
    console.log('1. Testando POST /api/index (Cadastrando 10 sites)...');
    for (const siteData of sitesParaCadastrar) {
        await fazerRequisicao({
            hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, JSON.stringify(siteData));
    }
    console.log('   -> 10 sites enviados para indexação com sucesso.');

    // --- Teste 2: Tentar indexar o primeiro site novamente (Erro de Conflito) ---
    console.log('\n2. Testando POST /api/index (Erro de Conflito)...');
    let response = await fazerRequisicao({
      hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(sitesParaCadastrar[0]));
    console.log(`   -> Status: ${response.statusCode} (Esperado: 409)`);
    console.log(`   -> Mensagem: "${response.body.mensagem}"`);

    // --- Teste 3: Realizar uma busca específica ---
    console.log('\n3. Testando GET /api/search (Busca Específica: "react ui")...');
    const searchQuery = encodeURIComponent('react ui');
    response = await fazerRequisicao({
      hostname: 'localhost', port: PORT, path: `/api/search?q=${searchQuery}`, method: 'GET'
    });
    console.log(`   -> Status: ${response.statusCode} (Esperado: 200)`);
    console.log(`   -> Resultados encontrados: ${response.body.resultados.length}`);
    console.log(`   -> Site encontrado: "${response.body.resultados[0].titulo}"`);

    // --- Teste 4: Realizar uma busca mais ampla ---
    console.log('\n4. Testando GET /api/search (Busca Ampla: "javascript")...');
    const broadQuery = encodeURIComponent('javascript');
    response = await fazerRequisicao({
      hostname: 'localhost', port: PORT, path: `/api/search?q=${broadQuery}`, method: 'GET'
    });
    console.log(`   -> Status: ${response.statusCode} (Esperado: 200)`);
    console.log(`   -> Resultados encontrados: ${response.body.resultados.length} (Esperado: 4)`);


    // --- Teste 5: Realizar uma busca sem resultados ---
    console.log('\n5. Testando GET /api/search (Busca sem Resultados)...');
    const emptyQuery = encodeURIComponent('palavra-que-nao-existe');
    response = await fazerRequisicao({
      hostname: 'localhost', port: PORT, path: `/api/search?q=${emptyQuery}`, method: 'GET'
    });
    console.log(`   -> Status: ${response.statusCode} (Esperado: 200)`);
    console.log(`   -> Resultados encontrados: ${response.body.resultados.length}`);
    
    // --- Teste 6: Acessar uma rota inválida ---
    console.log('\n6. Testando rota inválida (Erro 404)...');
    response = await fazerRequisicao({
      hostname: 'localhost', port: PORT, path: `/api/rota-invalida`, method: 'GET'
    });
    console.log(`   -> Status: ${response.statusCode} (Esperado: 404)`);
    console.log(`   -> Mensagem: "${response.body.mensagem}"`);

    // --- Teste 7: Tentar indexar com dados faltando ---
    console.log('\n7. Testando POST /api/index (Erro de Requisição Inválida)...');
    const badSiteData = { url: 'teste.com' };
    response = await fazerRequisicao({
        hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, JSON.stringify(badSiteData));
    console.log(`   -> Status: ${response.statusCode} (Esperado: 400)`);
    console.log(`   -> Mensagem: "${response.body.mensagem}"`);

  } catch (error) {
    console.error('\n--- ERRO CRÍTICO DURANTE OS TESTES ---', error);
  } finally {
    console.log('\n--- TESTES CONCLUÍDOS. DESLIGANDO O SERVIDOR. ---');
    server.close(() => {
        console.log('Servidor desligado.');
        process.exit();
    });
  }
}
iniciarAplicacao();

