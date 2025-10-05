const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', '..', 'logs', 'error.log');

/**
 * Garante que o diretório de logs exista. Se não, ele o cria.
 */
function ensureLogDirectoryExists() {
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

/**
 * Função para registrar uma mensagem de erro no arquivo de log.
 * @param {Error} error - O objeto de erro capturado no bloco catch.
 */
function logError(error) {
    ensureLogDirectoryExists();

    const timestamp = new Date().toISOString();

    const logMessage = `${timestamp} - ERRO: ${
        error.stack || error.message
    }\n\n`;

    fs.promises.appendFile(logFilePath, logMessage).catch((err) => {
        console.error('Falha crítica ao escrever no arquivo de log:', err);
    });
}

module.exports = {
    logError,
};
