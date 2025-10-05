const url = require('url');
const Website = require('../models/website');
const PalavraChave = require('../models/palavraChave');
const Index = require('../models/index');

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (body === '') {
                return resolve({});
            }
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
        req.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Controller para indexar uma nova página.
 * Funciona com o módulo http nativo.
 */
const indexarPagina = async (req, res) => {
    try {
        const body = await parseJsonBody(req);
        const { url, titulo, descricao, palavrasChave } = body;

        if (
            !url ||
            !titulo ||
            !palavrasChave ||
            !Array.isArray(palavrasChave) ||
            palavrasChave.length === 0
        ) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    sucesso: false,
                    mensagem:
                        'Os campos url, titulo e um array de palavrasChave são obrigatórios.',
                })
            );
            return;
        }

        const websiteId = await Website.cadastrar({ url, titulo, descricao });
        const promessasIds = palavrasChave.map((palavra) =>
            PalavraChave.buscarOuCriar(palavra)
        );
        const palavrasChaveIds = await Promise.all(promessasIds);
        await Index.indexar(websiteId, palavrasChaveIds);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: true,
                mensagem: 'Website indexado com sucesso!',
                websiteId: websiteId.toString(),
            })
        );
    } catch (error) {
        console.error('Erro ao indexar página:', error);

        const statusCode = error.statusCode || 500;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: false,
                mensagem: error.message || 'Ocorreu um erro no servidor.',
            })
        );
    }
};

/**
 * Controller para realizar uma busca.
 * Funciona com o módulo http nativo.
 */
const realizarBusca = async (req, res) => {
    try {
        const parsedUrl = url.parse(req.url, true);
        const { q } = parsedUrl.query;

        if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    sucesso: false,
                    mensagem: 'O parâmetro de busca "q" é obrigatório.',
                })
            );
            return;
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
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                sucesso: false,
                mensagem: 'Ocorreu um erro no servidor.',
            })
        );
    }
};

module.exports = {
    indexarPagina,
    realizarBusca,
};
