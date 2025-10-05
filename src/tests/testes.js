const http = require('http');
const url = require('url');

// --- CAMINHOS CORRIGIDOS ---
// Os caminhos agora partem da raiz do projeto para as pastas /src
const { connectToDatabase, getDb } = require('../config/database');
const {
    indexarPagina,
    realizarBusca,
    listarPalavrasChave,
    checkStatus,
} = require('../controllers/searchController');

const PORT = 3001; // Porta diferente para não conflitar com o servidor principal
let server;
const sockets = new Set();

// --- DADOS DE TESTE ---
const sitesParaCadastrar = [
    { url: 'https://www.mongodb.com/', titulo: 'MongoDB', descricao: 'Banco de dados NoSQL.', palavrasChave: ['mongodb', 'database', 'nosql', 'documento', 'big data'] },
    { url: 'https://nodejs.org/pt-br/', titulo: 'Node.js', descricao: 'Ambiente de execução JavaScript.', palavrasChave: ['nodejs', 'javascript', 'runtime', 'backend', 'v8'] },
    { url: 'https://www.typescriptlang.org/', titulo: 'TypeScript', descricao: 'JavaScript com tipos.', palavrasChave: ['typescript', 'javascript', 'tipos', 'compilador', 'frontend'] },
    { url: 'https://developer.mozilla.org/pt-BR/', titulo: 'MDN Web Docs', descricao: 'Recursos para desenvolvedores.', palavrasChave: ['mdn', 'javascript', 'html', 'css', 'web api'] },
    { url: 'https://react.dev/', titulo: 'React', descricao: 'Biblioteca para interfaces.', palavrasChave: ['react', 'javascript', 'frontend', 'biblioteca', 'ui'] },
    { url: 'https://www.docker.com/', titulo: 'Docker', descricao: 'Plataforma de contêineres.', palavrasChave: ['docker', 'container', 'devops', 'deploy', 'microserviços'] },
    { url: 'https://www.postman.com/', titulo: 'Postman', descricao: 'Plataforma para APIs.', palavrasChave: ['postman', 'api', 'testes', 'desenvolvimento', 'http'] },
    { url: 'https://git-scm.com/', titulo: 'Git', descricao: 'Sistema de controle de versão.', palavrasChave: ['git', 'controle de versão', 'scm', 'código fonte', 'devops'] },
    { url: 'https://www.utfpr.edu.br/', titulo: 'UTFPR', descricao: 'Universidade Tecnológica.', palavrasChave: ['utfpr', 'universidade', 'tecnologia', 'parana', 'brasil'] },
    { url: 'https://github.com/', titulo: 'GitHub', descricao: 'Plataforma de desenvolvimento.', palavrasChave: ['github', 'git', 'colaboração', 'código fonte', 'devops'] }
];

async function limparBancoDeDados() {
    console.log('--- Limpando banco de dados para o teste ---');
    const db = getDb();
    await Promise.all([
        db.collection('websites').deleteMany({}),
        db.collection('palavras_chave').deleteMany({}),
        db.collection('indices').deleteMany({}),
    ]);
    console.log('--- Banco de dados limpo ---');
}

async function iniciarServidorDeTeste() {
    try {
        await connectToDatabase();
        await limparBancoDeDados();

        server = http.createServer(async (req, res) => {
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

            if (pathname === '/api/index' && req.method === 'POST') await indexarPagina(req, res);
            else if (pathname === '/api/search' && req.method === 'GET') await realizarBusca(req, res);
            else if (pathname === '/api/keywords' && req.method === 'GET') await listarPalavrasChave(req, res);
            else if (pathname === '/api/status' && req.method === 'GET') await checkStatus(req, res);
            else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ sucesso: false, mensagem: 'Endpoint da API não encontrado.' }));
            }
        });

        server.on('connection', (socket) => {
            sockets.add(socket);
            socket.on('close', () => {
                sockets.delete(socket);
            });
        });

        server.listen(PORT, () => {
            console.log(`--- Servidor de teste rodando em http://localhost:${PORT} ---`);
            executarTestes();
        });
    } catch (error) {
        console.error('Falha ao iniciar o servidor de teste.', error);
        process.exit(1);
    }
}

function fazerRequisicao(options, postData = null) {
    // ⭐️ CORREÇÃO APLICADA: Desabilita o keep-alive para evitar travamentos
    const requestOptions = { ...options, agent: false };

    return new Promise((resolve, reject) => {
        const req = http.request(requestOptions, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    // Se a resposta não for um JSON válido, resolve com o corpo como texto
                    resolve({ statusCode: res.statusCode, body: body });
                }
            });
        });
        req.on('error', (e) => reject(e));
        if (postData) req.write(postData);
        req.end();
    });
}

async function executarTestes() {
    console.log('\n--- INICIANDO SUÍTE DE TESTES AUTOMATIZADOS ---\n');
    try {
        console.log('1. Testando GET /api/status (Conexão com DB)...');
        let response = await fazerRequisicao({ hostname: 'localhost', port: PORT, path: '/api/status', method: 'GET' });
        console.log(`   -> Status: ${response.statusCode} (Esperado: 200) - Mensagem: "${response.body.mensagem}"`);

        console.log('\n2. Testando POST /api/index (Indexando 10 sites)...');
        for (const site of sitesParaCadastrar) {
            await fazerRequisicao({ hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify(site));
        }
        console.log('   -> 10 sites enviados para indexação.');

        console.log('\n3. Testando GET /api/keywords (Listar Palavras-chave)...');
        response = await fazerRequisicao({ hostname: 'localhost', port: PORT, path: '/api/keywords', method: 'GET' });
        console.log(`   -> Status: ${response.statusCode} (Esperado: 200)`);
        const totalKeywords = response.body.palavrasChave ? response.body.palavrasChave.length : 0;
        console.log(`   -> Total de palavras-chave únicas encontradas: ${totalKeywords}`);

        console.log('\n4. Testando GET /api/search (Lógica "OU")...');
        const searchQuery = encodeURIComponent('javascript devops');
        response = await fazerRequisicao({ hostname: 'localhost', port: PORT, path: `/api/search?q=${searchQuery}`, method: 'GET' });
        console.log(`   -> Buscando por "javascript devops"`);
        console.log(`   -> Status: ${response.statusCode} (Esperado: 200)`);
        const totalResultadosOU = response.body.resultados ? response.body.resultados.length : 0;
        console.log(`   -> Resultados encontrados: ${totalResultadosOU}`);
        const primeiroResultadoTemKeywords = !!(totalResultadosOU > 0 && response.body.resultados[0].palavrasChave && response.body.resultados[0].palavrasChave.length > 0);
        console.log(`   -> Resultados contêm palavras-chave: ${primeiroResultadoTemKeywords}`);

        console.log('\n5. Testando POST /api/index (Erro de Conflito)...');
        response = await fazerRequisicao({ hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify(sitesParaCadastrar[0]));
        console.log(`   -> Status: ${response.statusCode} (Esperado: 409) - Mensagem: "${response.body.mensagem}"`);

        console.log('\n6. Testando POST /api/index (Requisição Inválida)...');
        response = await fazerRequisicao({ hostname: 'localhost', port: PORT, path: '/api/index', method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify({ url: 'bad.com' }));
        console.log(`   -> Status: ${response.statusCode} (Esperado: 400) - Mensagem: "${response.body.mensagem}"`);

    } catch (error) {
        console.error('\n--- ERRO CRÍTICO DURANTE OS TESTES ---', error);
    } finally {
        console.log('\n--- TESTES CONCLUÍDOS. DESLIGANDO O SERVIDOR. ---');

        // Lógica de desligamento robusta
        const forceExit = setTimeout(() => {
            console.error('Timeout: Desligamento gracioso falhou. Forçando o encerramento.');
            process.exit(1);
        }, 2000);

        server.close(() => {
            console.log('Servidor de teste desligado com sucesso.');
            clearTimeout(forceExit);
            process.exit(0);
        });

        for (const socket of sockets) {
            socket.destroy();
        }
    }
}

iniciarServidorDeTeste();
