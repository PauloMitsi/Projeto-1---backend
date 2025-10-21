## 📚 Projeto 1 (Recuperação): Biblioteca de Classes de Persistência com MongoDB

Este projeto foi desenvolvido para a disciplina de **EC48B-C71 - Programação Web Back-End** da UTFPR.

Em atendimento ao feedback da recuperação, a estrutura da aplicação foi simplificada, removendo o servidor HTTP, o sistema de rotas e a arquitetura MVC. O foco do projeto agora é a criação e demonstração da **Biblioteca de Classes de Acesso a Dados (Model/DAO)**, incluindo operações CRUD, validações, conexão com o MongoDB e um sistema de log de erros.

-----

## ✨ Recursos e Funcionalidades

O projeto é uma biblioteca de classes capaz de simular um **serviço de busca**, indexando websites e realizando buscas eficientes por palavras-chave:

  * **Classes de Persistência (Models):** Implementação das três classes de armazenamento (`Website`, `PalavraChave` e `Index`) com métodos CRUD (Create, Read, Update, Delete).
  * **Indexação e Busca:** Lógica para cadastrar websites, gerenciar palavras-chave e realizar buscas por termos.
  * **Validação de Dados:** Verificação de campos obrigatórios e tratamento de conflito (websites duplicados) diretamente nas classes de modelo.
  * **Logging de Erros:** Módulo dedicado (`src/utils/logger.js`) para capturar e registrar automaticamente todas as exceções em um arquivo de texto (`/logs/error.log`).
  * **Ponto de Entrada para Teste:** O arquivo `main.js` atua como o script de teste para demonstrar a funcionalidade de todas as classes.

-----

## 📂 Estrutura de Arquivos (Pós-Recuperação)

A estrutura foi simplificada para conter apenas as classes de domínio e infraestrutura, conforme solicitado:

```
/projeto-1-backend
|
|-- /logs/             # Armazena os arquivos de log de erros
|-- /src/              # Contém o código-fonte principal
|   |-- /config/       # Configuração do banco de dados
|   |   |-- config.js
|   |   |-- database.js
|   |-- /models/       # Classes de Persistência (Website, PalavraChave, Index)
|   |   |-- index.js
|   |   |-- palavraChave.js
|   |   |-- website.js
|   |-- /utils/        # Utilitários (Logger)
|   |   |-- logger.js
|
|-- main.js            # Script principal de demonstração e teste (Novo Ponto de Entrada)
|-- package.json
|-- README.md
```

-----

## 🛠️ Como Executar o Projeto

Siga os passos abaixo para configurar e executar a demonstração do projeto via console.

### 1\. Pré-requisitos

  * **Node.js:** Versão 18 ou superior.
  * **MongoDB:** É necessário ter uma instância do MongoDB rodando localmente (ou alterar a URI de conexão).

### 2\. Instalação e Configuração

**a. Instale as dependências:**

```bash
npm install
```

**b. Configure a Conexão:**
Abra o arquivo `/src/config/config.js` e garanta que a `MONGODB_URI` aponte para sua instância do MongoDB.

### 3\. Executando a Demonstração

O projeto é executado através do script `main.js`, que demonstra as operações de Indexação (CREATE), Busca (READ) e Remoção (DELETE) das classes.

Execute o seguinte comando no terminal:

```bash
npm start
# Ou diretamente: node main.js
```

**Saída Esperada:** O terminal exibirá o log de conexão, a demonstração de indexação de sites, a validação de duplicação, a listagem de palavras-chave e a busca, comprovando o funcionamento das classes.

**Logs de Erro:** Qualquer falha (como a tentativa de duplicidade) será registrada automaticamente em `/logs/error.log`.

-----

## ✅ Critérios de Avaliação Atendidos (Recuperação)

O projeto foi ajustado para focar estritamente nos requisitos mínimos da disciplina:

  * [x] **Remoção de Estrutura Web:** Os arquivos de rotas, controllers e o servidor HTTP (`server.js`) foram removidos.
  * [x] **Classes com CRUD:** Implementação das classes `Website`, `PalavraChave` e `Index` com métodos de CRUD/Uso.
  * [x] **Arquivo de Banco de Dados:** Conexão centralizada em `src/config/database.js`.
  * [x] **Validações Necessárias:** Validações de campos e regras de negócio (duplicidade de URL) implementadas nas classes de modelo.
  * [x] **Classe de Log de Erro:** Módulo `logger.js` funcional, registrando erros em `.txt`.
  * [x] **Main/App/Index.js para Teste:** O arquivo `main.js` demonstra o uso de todas as classes via console.

-----

### Autor(es)

  * Paulo Cesar De Oliveira Mitsi - 2410362