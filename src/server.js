const http = require('http');
const url = require('url');
const { connectToDatabase } = require('./config/database');
const {
    indexarPagina,
    realizarBusca,
} = require('./controllers/searchController');

const PORT = 3000;

async function iniciarServidor() {
    try {
        await connectToDatabase();

        const server = http.createServer(async (req, res) => {
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
                res.end(
                    JSON.stringify({
                        sucesso: false,
                        mensagem: 'Rota não encontrada.',
                    })
                );
            }
        });

        server.listen(PORT, () => {
            console.log(
                `--- ✅ Servidor da API rodando com sucesso em http ---`
            );
            console.log(
                'Agora você pode abrir o arquivo index.html no seu navegador.'
            );
        });
    } catch (error) {
        console.error('❌ Falha crítica ao iniciar o servidor.', error);
        process.exit(1);
    }
}

iniciarServidor();
