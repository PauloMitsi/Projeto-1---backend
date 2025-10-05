const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class Index {
    constructor() {
        this.collection = getDb().collection('indices');
    }

    /**
     * Associa um website a uma lista de palavras-chave no índice.
     * Para cada palavra-chave, adiciona o ID do website à sua lista de ocorrências.
     * @param {ObjectId} websiteId - O ID do site a ser indexado.
     * @param {Array<ObjectId>} palavrasChaveIds - Uma lista de IDs de palavras-chave.
     * @returns {Promise<object>} O resultado da operação em lote (bulkWrite).
     */
    async indexar(websiteId, palavrasChaveIds) {
        if (
            !websiteId ||
            !palavrasChaveIds ||
            !Array.isArray(palavrasChaveIds) ||
            palavrasChaveIds.length === 0
        ) {
            throw new Error(
                'ID do Website e a lista de IDs de palavras-chave são obrigatórios para indexar.'
            );
        }

        try {
            const operations = palavrasChaveIds.map((palavraId) => ({
                updateOne: {
                    filter: { _id: palavraId },

                    update: { $addToSet: { websites: websiteId } },
                    upsert: true,
                },
            }));

            return await this.collection.bulkWrite(operations);
        } catch (error) {
            console.error('Erro ao indexar website:', error);

            throw error;
        }
    }

    /**
     * Busca por websites que contenham TODAS as palavras-chave fornecidas.
     * @param {Array<ObjectId>} palavrasChaveIds - Lista de IDs das palavras-chave para a busca.
     * @returns {Promise<Array<ObjectId>>} Uma lista de IDs de websites que correspondem à busca.
     */
    async buscar(palavrasChaveIds) {
        if (
            !palavrasChaveIds ||
            !Array.isArray(palavrasChaveIds) ||
            palavrasChaveIds.length === 0
        ) {
            return [];
        }

        try {
            const cursor = this.collection.find(
                { _id: { $in: palavrasChaveIds } },
                { projection: { _id: 0, websites: 1 } }
            );

            const arraysDeWebsites = await cursor.toArray();

            if (arraysDeWebsites.length < palavrasChaveIds.length) {
                return [];
            }

            const listasDeIds = arraysDeWebsites.map((doc) =>
                doc.websites.map((id) => id.toString())
            );
            const intersecao = listasDeIds.reduce((a, b) =>
                a.filter((c) => b.includes(c))
            );

            return intersecao.map((idStr) => new ObjectId(idStr));
        } catch (error) {
            console.error('Erro ao realizar busca no índice:', error);

            throw error;
        }
    }
}

module.exports = Index;
