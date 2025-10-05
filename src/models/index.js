const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

/**
 * Classe Index para gerenciar a coleção 'indices', que implementa um índice invertido.
 * Esta é a terceira classe de armazenamento do projeto.
 */
class Index {
  constructor() {
    this.collection = getDb().collection('indices');
  }

  /**
   * Associa um website a uma lista de palavras-chave no índice.
   * @param {ObjectId} websiteId - O ID do site a ser indexado.
   * @param {Array<ObjectId>} palavrasChaveIds - Uma lista de IDs de palavras-chave.
   * @returns {Promise<object>} O resultado da operação em lote (bulkWrite).
   */
  async indexar(websiteId, palavrasChaveIds) {
    if (!websiteId || !palavrasChaveIds || !Array.isArray(palavrasChaveIds) || palavrasChaveIds.length === 0) {
      throw new Error("ID do Website e a lista de IDs de palavras-chave são obrigatórios para indexar.");
    }
    try {
      const operations = palavrasChaveIds.map(palavraId => ({
        updateOne: {
          filter: { _id: palavraId },
          update: { $addToSet: { websites: websiteId } },
          upsert: true
        }
      }));
      return await this.collection.bulkWrite(operations);
    } catch (error) {
      console.error("Erro ao indexar website:", error);
      throw error;
    }
  }

  /**
   * Busca por websites que contenham QUALQUER UMA das palavras-chave fornecidas (lógica OU).
   * @param {Array<ObjectId>} palavrasChaveIds - Lista de IDs das palavras-chave para a busca.
   * @returns {Promise<Array<ObjectId>>} Uma lista de IDs de websites que correspondem à busca.
   */
  async buscar(palavrasChaveIds) {
    if (!palavrasChaveIds || !Array.isArray(palavrasChaveIds) || palavrasChaveIds.length === 0) {
      return [];
    }
    try {
      const cursor = this.collection.find(
        { _id: { $in: palavrasChaveIds } },
        { projection: { _id: 0, websites: 1 } }
      );
      const arraysDeWebsites = await cursor.toArray();
      if (arraysDeWebsites.length === 0) {
        return [];
      }

      // --- LÓGICA "OU" (UNIÃO) APLICADA AQUI ---
      // 1. Cria um Set para armazenar os IDs de forma única, evitando duplicatas.
      const allWebsiteIds = new Set();
      
      // 2. Itera sobre a lista de documentos retornados do banco.
      arraysDeWebsites.forEach(doc => {
        // 3. Para cada documento, adiciona todos os IDs de website ao Set.
        doc.websites.forEach(websiteId => {
            allWebsiteIds.add(websiteId.toString());
        });
      });

      // 4. Converte o Set de volta para um array de ObjectIds.
      const uniqueIds = Array.from(allWebsiteIds);
      return uniqueIds.map(idStr => new ObjectId(idStr));

    } catch (error) {
      console.error("Erro ao realizar busca no índice:", error);
      throw error;
    }
  }
}

module.exports = Index;

