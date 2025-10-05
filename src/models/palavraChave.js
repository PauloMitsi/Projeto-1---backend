const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class PalavraChave {
    constructor() {
        this.collection = getDb().collection('palavras_chave');
    }

    /**
     * Busca uma palavra-chave no banco de dados. Se a palavra não existir,
     * ela é inserida. O método sempre retorna o _id da palavra.
     * Este método combina as operações de busca e inserção.
     * @param {string} palavra A palavra a ser buscada ou criada.
     * @returns {Promise<ObjectId>} O ID da palavra-chave no banco de dados.
     */
    async buscarOuCriar(palavra) {
        if (!palavra || typeof palavra !== 'string' || palavra.trim() === '') {
            throw new Error('A palavra-chave não pode ser vazia.');
        }

        const palavraFormatada = palavra.trim().toLowerCase();

        try {
            const palavraExistente = await this.collection.findOne({
                palavra: palavraFormatada,
            });

            if (palavraExistente) {
                return palavraExistente._id;
            } else {
                const result = await this.collection.insertOne({
                    palavra: palavraFormatada,
                });

                return result.insertedId;
            }
        } catch (error) {
            console.error('Erro ao buscar ou criar palavra-chave:', error);

            throw error;
        }
    }

    /**
     * Busca uma palavra-chave específica pelo seu texto.
     * @param {string} palavra O texto da palavra-chave a ser buscada.
     * @returns {Promise<object|null>} O documento da palavra-chave ou null se não for encontrado.
     */
    async buscarPorPalavra(palavra) {
        const palavraFormatada = palavra.trim().toLowerCase();
        try {
            const resultado = await this.collection.findOne({
                palavra: palavraFormatada,
            });
            return resultado;
        } catch (error) {
            console.error('Erro ao buscar palavra-chave:', error);
            throw error;
        }
    }
}

module.exports = PalavraChave;
