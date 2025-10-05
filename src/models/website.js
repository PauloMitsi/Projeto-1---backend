const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

/**
 * Classe Website para gerenciar as operações da coleção 'websites' no MongoDB.
 */
class Website {
    constructor() {
        this.collection = getDb().collection('websites');
    }

    /**
     * Cadastra um novo website no banco de dados.
     */
    async cadastrar(websiteData) {
        if (!websiteData.url || !websiteData.titulo) {
            throw new Error('URL e Título são campos obrigatórios.');
        }

        try {
            const siteExistente = await this.collection.findOne({
                url: websiteData.url,
            });
            if (siteExistente) {
                const error = new Error('Website com esta URL já cadastrado.');
                error.statusCode = 409;
                throw error;
            }

            const novoSite = {
                url: websiteData.url,
                titulo: websiteData.titulo,
                descricao: websiteData.descricao || '',
                palavrasChave: websiteData.palavrasChave || [],
                data_cadastro: new Date(),
            };

            const result = await this.collection.insertOne(novoSite);
            return result.insertedId;
        } catch (error) {
            console.error('Erro ao cadastrar website no MongoDB:', error);
            throw error;
        }
    }

    /**
     * Busca websites por uma lista de IDs.
     */
    async buscarPorIds(ids) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return [];
        }

        try {
            const websites = await this.collection
                .find({
                    _id: { $in: ids },
                })
                .toArray();
            return websites;
        } catch (error) {
            console.error('Erro ao buscar websites por IDs:', error);
            throw error;
        }
    }

    /**
     * Remove um website do banco de dados pelo seu ID.
     */
    async removerPorId(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error('ID fornecido é inválido.');
        }
        try {
            const resultado = await this.collection.deleteOne({
                _id: new ObjectId(id),
            });
            return resultado;
        } catch (error) {
            console.error('Erro ao remover website por ID:', error);
            throw error;
        }
    }
}

module.exports = Website;
