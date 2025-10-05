const API_BASE_URL = 'http://localhost:3000';

const indexForm = document.getElementById('index-form');
const searchForm = document.getElementById('search-form');
const statusMessage = document.getElementById('status-message');
const resultsContainer = document.getElementById('results-container');

// --- Lógica para Indexar um Site ---
indexForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const url = document.getElementById('url').value;
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const palavrasChave = document
        .getElementById('palavrasChave')
        .value.split(',')
        .map((kw) => kw.trim())
        .filter((kw) => kw); // Remove itens vazios

    const body = { url, titulo, descricao, palavrasChave };

    try {
        const response = await fetch(`${API_BASE_URL}/api/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            displayMessage(`✅ ${data.mensagem}`, 'success');
            indexForm.reset();
        } else {
            displayMessage(`❌ Erro: ${data.mensagem}`, 'error');
        }
    } catch (error) {
        displayMessage(
            `❌ Erro de conexão: Não foi possível se conectar ao servidor.`,
            'error'
        );
    }
});

// --- Lógica para Realizar uma Busca ---
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('search-query').value;
    if (!query) return;

    resultsContainer.innerHTML = '<p>Buscando...</p>';
    displayMessage(''); // Limpa mensagens antigas

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        if (response.ok && data.sucesso) {
            displayResults(data.resultados);
        } else {
            displayMessage(`❌ Erro: ${data.mensagem}`, 'error');
        }
    } catch (error) {
        displayMessage(
            `❌ Erro de conexão: Não foi possível se conectar ao servidor.`,
            'error'
        );
    }
});

// --- Funções Auxiliares de Exibição ---
function displayMessage(message, type = 'info') {
    statusMessage.innerHTML = message;
    statusMessage.className = type;
}

function displayResults(results) {
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores
    if (results.length === 0) {
        resultsContainer.innerHTML =
            '<p>Nenhum resultado encontrado para a sua busca.</p>';
        return;
    }

    results.forEach((site) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const title = document.createElement('h3');
        title.textContent = site.titulo;

        const link = document.createElement('a');
        link.href = site.url;
        link.textContent = site.url;
        link.target = '_blank'; // Abrir em nova aba

        const description = document.createElement('p');
        description.textContent = site.descricao;

        resultItem.appendChild(title);
        resultItem.appendChild(link);
        resultItem.appendChild(description);
        resultsContainer.appendChild(resultItem);
    });
}
