const { MongoClient } = require('mongodb');

const config = require('./config');

const uri = config.MONGODB_URI;
const dbName = config.DB_NAME;

if (!uri) {
    throw new Error(
        'A variável MONGODB_URI não está definida em /src/config/config.js'
    );
}

const client = new MongoClient(uri);
let dbInstance;

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log('Conectado com sucesso ao servidor MongoDB!');
        dbInstance = client.db(dbName);
    } catch (error) {
        console.error('Falha ao conectar ao MongoDB', error);

        process.exit(1);
    }
};

const getDb = () => {
    if (!dbInstance) {
        throw new Error(
            'A conexão com o banco de dados não foi estabelecida. Chame connectToDatabase() primeiro.'
        );
    }
    return dbInstance;
};

module.exports = {
    connectToDatabase,
    getDb,
};
