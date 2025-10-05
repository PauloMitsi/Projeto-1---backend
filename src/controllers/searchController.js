const url = require('url');
// 1. Importa as CLASSES dos models, não as instâncias
const WebsiteModel = require('../models/website');
const PalavraChaveModel = require('../models/palavraChave');
const IndexModel = require('../models/index');
const { logError } = require('../utils/logger');

// Função auxiliar para processar o corpo de requisições JSON (inalterada)
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', () => {
            if (body === '') return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                const parseError = new Error(
                    'Corpo da requisição JSON inválido.'
                );
                parseError.statusCode = 400;
                reject(parseError);
            }
        });
        req.on('error', (err) => reject(err));
    });
}

const indexarPagina = async (req, res) => {
    try {
        const Website = new WebsiteModel();
        const PalavraChave = new PalavraChaveModel();
        const Index = new IndexModel();

        const body = await parseJsonBody(req);
        const { url, titulo, descricao, palavrasChave } = body;

        if (!url || !titulo || !palavrasChave || !Array.isArray(palavrasChave) || palavrasChave.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                sucesso: false,
                mensagem: 'Os campos url, titulo e um array de palavrasChave são obrigatórios.'
            }));
        }

        // --- ALTERAÇÃO APLICADA AQUI ---
        // Passa as palavras-chave para o método de cadastro do site
        const websiteId = await Website.cadastrar({ url, titulo, descricao, palavrasChave });
        
        const promessasIds = palavrasChave.map(palavra => PalavraChave.buscarOuCriar(palavra));
        const palavrasChaveIds = await Promise.all(promessasIds);
        await Index.indexar(websiteId, palavrasChaveIds);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            sucesso: true,
            mensagem: 'Website indexado com sucesso!',
            websiteId: websiteId.toString()
        }));

    } catch (error) {
        // ... (bloco catch inalterado) ...
    }
};

const realizarBusca = async (req, res) => {
    try {
        // --- CORREÇÃO APLICADA AQUI ---
        const Website = new WebsiteModel();
        const PalavraChave = new PalavraChaveModel();
        const Index = new IndexModel();

        const parsedUrl = url.parse(req.url, true);
        const { q } = parsedUrl.query;

        if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(
                JSON.stringify({
                    sucesso: false,
                    mensagem: 'O parâmetro de busca "q" é obrigatório.',
                })
            );
        }

        const palavrasDaBusca = q.trim().split(/\s+/);
        const promessasBuscaIds = palavrasDaBusca.map((palavra) =>
            PalavraChave.buscarOuCriar(palavra)
        );
        const idsParaBuscar = await Promise.all(promessasBuscaIds);
        const websitesIdsEncontrados = await Index.buscar(idsParaBuscar);
        const resultadosFinais = await Website.buscarPorIds(
            websitesIdsEncontrados
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: true,
                resultados: resultadosFinais,
            })
        );
    } catch (error) {
        console.error('Erro ao realizar busca:', error);
        logError(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: false,
                mensagem: 'Ocorreu um erro no servidor.',
            })
        );
    }
};

const listarPalavrasChave = async (req, res) => {
    try {
        const PalavraChave = new PalavraChaveModel();
        const palavras = await PalavraChave.listarTodas();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: true,
                palavrasChave: palavras,
            })
        );
    } catch (error) {
        console.error('Erro ao listar palavras-chave:', error);
        logError(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: false,
                mensagem: 'Ocorreu um erro no servidor.',
            })
        );
    }
};

const checkStatus = async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        sucesso: true,
        mensagem: 'Conexão com o banco de dados estabelecida com sucesso.'
    }));
};

module.exports = {
    checkStatus,
    indexarPagina,
    realizarBusca,
    listarPalavrasChave, // <-- Adicione a nova função aqui
};
