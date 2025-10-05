document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    const INITIAL_TAGS_LIMIT = 15;

    const indexForm = document.getElementById('index-form');
    const searchForm = document.getElementById('search-form');
    const statusMessage = document.getElementById('status-message');
    const resultsContainer = document.getElementById('results-container');

    const indexTagsContainer = document.getElementById('index-tags-container');
    const searchTagsContainer = document.getElementById(
        'search-tags-container'
    );
    const indexShowMoreContainer = document.getElementById(
        'index-show-more-container'
    );
    const searchShowMoreContainer = document.getElementById(
        'search-show-more-container'
    );

    const palavrasChaveInput = document.getElementById('palavrasChave');
    const searchQueryInput = document.getElementById('search-query');

    const dbStatusIndicator = document.getElementById('db-status');
    const dbStatusText = dbStatusIndicator.querySelector('.status-text');

    let allKeywords = [];
    let selectedIndexKeywords = new Set();
    let selectedSearchKeywords = new Set();

    async function checkDbStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/status`);
            if (response.ok) {
                const data = await response.json();
                dbStatusIndicator.className = 'status-indicator success';
                dbStatusText.textContent = data.mensagem;
            } else {
                throw new Error('Servidor respondeu com erro.');
            }
        } catch (error) {
            dbStatusIndicator.className = 'status-indicator error';
            dbStatusText.textContent =
                'Falha na conexão com o servidor/banco de dados.';
        }
    }

    async function fetchKeywords() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/keywords`);
            const data = await response.json();
            if (data.sucesso) {
                allKeywords = data.palavrasChave;
                renderTags(
                    indexTagsContainer,
                    indexShowMoreContainer,
                    selectedIndexKeywords,
                    false
                );
                renderTags(
                    searchTagsContainer,
                    searchShowMoreContainer,
                    selectedSearchKeywords,
                    false
                );
            } else {
                displayTagError(
                    indexTagsContainer,
                    'Não foi possível carregar as tags.'
                );
                displayTagError(
                    searchTagsContainer,
                    'Não foi possível carregar as tags.'
                );
            }
        } catch (error) {
            displayTagError(
                indexTagsContainer,
                'Erro de conexão ao buscar tags.'
            );
            displayTagError(
                searchTagsContainer,
                'Erro de conexão ao buscar tags.'
            );
        }
    }

    function renderTags(container, showMoreContainer, selectedSet, showAll) {
        container.innerHTML = '';
        showMoreContainer.innerHTML = '';

        const keywordsToRender = showAll
            ? allKeywords
            : allKeywords.slice(0, INITIAL_TAGS_LIMIT);

        if (allKeywords.length === 0) {
            container.innerHTML = '<p>Nenhuma tag cadastrada ainda.</p>';
            return;
        }

        keywordsToRender.forEach((kw) => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.textContent = kw.palavra;
            tag.dataset.keyword = kw.palavra;
            if (selectedSet.has(kw.palavra)) {
                tag.classList.add('selected');
            }
            container.appendChild(tag);
        });

        if (!showAll && allKeywords.length > INITIAL_TAGS_LIMIT) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.type = 'button';
            showMoreBtn.className = 'show-more-btn';
            showMoreBtn.textContent = `Mostrar mais ${
                allKeywords.length - INITIAL_TAGS_LIMIT
            } tags...`;
            showMoreBtn.onclick = () =>
                renderTags(container, showMoreContainer, selectedSet, true);
            showMoreContainer.appendChild(showMoreBtn);
        }

        if (showAll && allKeywords.length > INITIAL_TAGS_LIMIT) {
            const showLessBtn = document.createElement('button');
            showLessBtn.type = 'button';
            showLessBtn.className = 'show-more-btn';
            showLessBtn.textContent = 'Mostrar menos';
            showLessBtn.onclick = () =>
                renderTags(container, showMoreContainer, selectedSet, false);
            showMoreContainer.appendChild(showLessBtn);
        }
    }

    function displayTagError(container, message) {
        container.innerHTML = `<p class="error-message">${message}</p>`;
    }

    indexTagsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('keyword-tag')) {
            const keyword = event.target.dataset.keyword;
            event.target.classList.toggle('selected');
            if (selectedIndexKeywords.has(keyword)) {
                selectedIndexKeywords.delete(keyword);
            } else {
                selectedIndexKeywords.add(keyword);
            }
            palavrasChaveInput.value = Array.from(selectedIndexKeywords).join(
                ', '
            );
        }
    });

    searchTagsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('keyword-tag')) {
            const keyword = event.target.dataset.keyword;
            event.target.classList.toggle('selected');
            if (selectedSearchKeywords.has(keyword)) {
                selectedSearchKeywords.delete(keyword);
            } else {
                selectedSearchKeywords.add(keyword);
            }
            searchQueryInput.value = Array.from(selectedSearchKeywords).join(
                ' '
            );
        }
    });

    searchQueryInput.addEventListener('search', (event) => {
        if (event.target.value === '') {
            selectedSearchKeywords.clear();
            renderTags(
                searchTagsContainer,
                searchShowMoreContainer,
                selectedSearchKeywords,
                false
            );
        }
    });

    indexForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const url = document.getElementById('url').value;
        const titulo = document.getElementById('titulo').value;
        const descricao = document.getElementById('descricao').value;
        const inputKeywords = palavrasChaveInput.value
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
        const palavrasChave = Array.from(
            new Set([...selectedIndexKeywords, ...inputKeywords])
        );

        if (palavrasChave.length === 0) {
            displayMessage(
                '❌ Erro: Pelo menos uma palavra-chave é necessária.',
                'error'
            );
            return;
        }

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
                selectedIndexKeywords.clear();
                await fetchKeywords();
            } else if (response.status === 409) {
                displayMessage(`⚠️ Atenção: ${data.mensagem}`, 'warning');
            } else {
                displayMessage(`❌ Erro: ${data.mensagem}`, 'error');
            }
        } catch (error) {
            displayMessage(`❌ Erro de conexão com o servidor.`, 'error');
        }
    });

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const query = searchQueryInput.value;
        if (!query) return;

        resultsContainer.innerHTML = '<p>Buscando...</p>';
        displayMessage('');

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
            displayMessage(`❌ Erro de conexão com o servidor.`, 'error');
        }
    });

    function displayMessage(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = type;
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML =
                '<p>Nenhum resultado encontrado para a sua busca.</p>';
            return;
        }

        results.forEach((site) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const formattedDate = new Date(
                site.data_cadastro
            ).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const tagsHTML =
                site.palavrasChave && site.palavrasChave.length > 0
                    ? `<div class="result-tags-container">
                       ${site.palavrasChave
                           .map((kw) => `<span class="result-tag">${kw}</span>`)
                           .join('')}
                   </div>`
                    : '';

            resultItem.innerHTML = `
                <h3>${site.titulo}</h3>
                <a href="${site.url}" target="_blank">${site.url}</a>
                <p class="description">${site.descricao || ''}</p>
                ${tagsHTML}
                <div class="result-meta">
                    <span class="meta-info">Indexado em: ${formattedDate.replace(
                        ',',
                        ' às'
                    )}</span>
                </div>
            `;
            resultsContainer.appendChild(resultItem);
        });
    }

    async function init() {
        await checkDbStatus();
        await fetchKeywords();
    }

    init();
});
