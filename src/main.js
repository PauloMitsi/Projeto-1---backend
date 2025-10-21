const { connectToDatabase } = require('./config/database');
const Website = require('./models/website');
const PalavraChave = require('./models/palavraChave');
const Index = require('./models/index');
const { logError } = require('./utils/logger');
const { ObjectId } = require('mongodb');

async function indexarPagina(url, titulo, descricao, palavrasChave) {
    if (!url || !titulo || !palavrasChave || palavrasChave.length === 0) {
        throw new Error(
            'Os campos url, titulo e palavrasChave são obrigatórios.'
        );
    }

    const websiteModel = new Website();
    const palavraChaveModel = new PalavraChave();
    const indexModel = new Index();

    try {
        const websiteId = await websiteModel.cadastrar({
            url,
            titulo,
            descricao,
            palavrasChave,
        });

        const promessasIds = palavrasChave.map((palavra) =>
            palavraChaveModel.buscarOuCriar(palavra)
        );
        const palavrasChaveIds = await Promise.all(promessasIds);

        await indexModel.indexar(websiteId, palavrasChaveIds);

        console.log(
            `✅ Website indexado: ${titulo} (ID: ${websiteId.toString()})`
        );
        return websiteId;
    } catch (error) {
        console.error(`❌ Falha ao indexar ${url}: ${error.message}`);
        logError(error);
        return null;
    }
}

async function realizarBusca(query) {
    if (!query) {
        console.log('Nenhuma query de busca fornecida.');
        return [];
    }

    const palavraChaveModel = new PalavraChave();
    const indexModel = new Index();
    const websiteModel = new Website();

    try {
        const palavrasDaBusca = query
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (palavrasDaBusca.length === 0) return [];

        const promessasBuscaIds = palavrasDaBusca.map((palavra) =>
            palavraChaveModel
                .buscarPorPalavra(palavra)
                .then((doc) => (doc ? doc._id : null))
        );

        const idsParaBuscar = (await Promise.all(promessasBuscaIds)).filter(
            ObjectId.isValid
        );

        if (idsParaBuscar.length === 0) {
            console.log(
                `Nenhuma palavra-chave encontrada para a busca: "${query}"`
            );
            return [];
        }

        const websitesIdsEncontrados = await indexModel.buscar(idsParaBuscar);

        const resultadosFinais = await websiteModel.buscarPorIds(
            websitesIdsEncontrados
        );

        return resultadosFinais;
    } catch (error) {
        console.error(
            `❌ Erro ao realizar busca por "${query}": ${error.message}`
        );
        logError(error);
        return [];
    }
}

async function listarPalavrasChave() {
    const palavraChaveModel = new PalavraChave();
    try {
        const palavras = await palavraChaveModel.listarTodas();
        console.log(`\n✅ Total de palavras-chave no DB: ${palavras.length}`);
        console.log('Palavras: ' + palavras.map((p) => p.palavra).join(', '));
        return palavras;
    } catch (error) {
        console.error('❌ Erro ao listar palavras-chave:', error.message);
        logError(error);
        return [];
    }
}

async function main() {
    console.log(
        '--- Projeto de Recuperação: Serviço de Busca (Sem MVC/Rotas) ---'
    );
    console.log('Conectando ao banco de dados...');
    await connectToDatabase();

    const websiteModel = new Website();

    console.log('\n======================================================');
    console.log('1. Demonstração da Indexação (CREATE)');
    console.log('======================================================');

    const site1 = {
        url: 'https://exemplo1.com',
        titulo: 'Site de Teste 1: Node.js e MongoDB',
        descricao: 'Exemplo de aplicação backend com Node e Mongo.',
        palavrasChave: ['node', 'mongodb', 'backend', 'teste'],
    };

    const id1 = await indexarPagina(
        site1.url,
        site1.titulo,
        site1.descricao,
        site1.palavrasChave
    );

    await indexarPagina(
        site1.url,
        site1.titulo,
        site1.descricao,
        site1.palavrasChave
    );

    console.log('\n======================================================');
    console.log('2. Demonstração de Palavras-chave (READ)');
    console.log('======================================================');
    await listarPalavrasChave();

    console.log('\n======================================================');
    console.log('3. Demonstração da Busca (READ)');
    console.log('======================================================');

    let resultados;
    resultados = await realizarBusca('node');
    console.log(
        `\nBusca por "node" (esperado: Site 1): ${resultados.length} resultados`
    );
    resultados.forEach((r) => console.log(`   - ${r.titulo}`));

    resultados = await realizarBusca('react');
    console.log(
        `\nBusca por "react" (esperado: Site 2): ${resultados.length} resultados`
    );
    resultados.forEach((r) => console.log(`   - ${r.titulo}`));

    console.log('\n======================================================');
    console.log('4. Demonstração de Remoção de Website (DELETE)');
    console.log('======================================================');

    if (id1) {
        const resultadoRemocao = await websiteModel.removerPorId(
            id1.toString()
        );
        if (resultadoRemocao.deletedCount > 0) {
            console.log(`✅ Website 1 removido com sucesso do DB: ${id1}`);
        } else {
            console.log(`⚠️ Falha ao remover Website 1: ${id1}`);
        }
    }

    resultados = await realizarBusca('node');
    console.log(
        `\nBusca por "node" após remoção do Site 1 (esperado: 0): ${resultados.length} resultados`
    );
    if (resultados.length === 0)
        console.log('   - Confirmação: Nenhum resultado encontrado.');

    console.log('\n--- FIM DA DEMONSTRAÇÃO ---');
    console.log(
        'Verifique o arquivo ./logs/error.log para o erro de duplicação do Site 1.'
    );
}

main().catch((error) => {
    console.error('\n--- Erro fatal na execução do main ---', error);
    logError(error);
    process.exit(1);
});
