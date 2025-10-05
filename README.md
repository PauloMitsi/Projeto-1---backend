# 🚀 Projeto 1: Serviço de Busca (Back-End)

Este projeto foi desenvolvido para a disciplina de **EC48B-C71 - Programação Web Back-End** da Universidade Tecnológica Federal do Paraná (UTFPR).

O objetivo é a criação de uma biblioteca de acesso a banco de dados em Node.js, com a temática de um **serviço de busca** (similar ao Google), capaz de indexar websites e buscá-los por palavras-chave. A aplicação foi construída utilizando apenas módulos nativos do Node.js para o servidor HTTP, sem o uso de frameworks como o Express.

---

## ✨ Recursos e Funcionalidades

* **Servidor HTTP Nativo:** Toda a aplicação roda sobre o módulo `http` do Node.js, incluindo um servidor de arquivos estáticos para a interface de teste.
* **Indexação de Websites:** API para cadastrar novos sites, extraindo e associando suas palavras-chave.
* **Busca por Palavras-Chave:** Implementação de um sistema de busca que retorna sites que contenham **todos** os termos pesquisados (lógica AND).
* **Estrutura de Índice Invertido:** Uso de uma coleção no MongoDB para criar um índice invertido, garantindo buscas eficientes.
* **Tratamento de Erros:** Validação de entradas e tratamento de exceções em todas as camadas da aplicação.
* **Logging de Erros:** Armazenamento automático de todas as exceções capturadas no arquivo `/logs/error.log`.
* **Teste Automatizado:** Script de teste dedicado que valida todas as funcionalidades da API.

---

## 📂 Estrutura de Arquivos

O projeto adota uma estrutura profissional que separa claramente as responsabilidades do back-end, front-end e testes.

```

/projeto-1-backend
|
|-- /logs/             \# Armazena os arquivos de log de erros
|-- /public/           \# Contém os arquivos de front-end (HTML, CSS)
|   |-- index.html
|   |-- style.css
|
|-- /src/              \# Contém todo o código-fonte do back-end
|   |-- /config/
|   |-- /controllers/
|   |-- /models/
|   |-- /utils/
|   |-- server.js        \# Ponto de entrada do servidor da API
|
|-- /tests/            \# Contém os scripts de teste
|   |-- testes.js
|
|-- .gitignore
|-- package.json
|-- README.md

````

---

## 🛠️ Como Executar o Projeto

Siga os passos abaixo para configurar e executar a aplicação em seu ambiente local.

### 1. Pré-requisitos

* **Node.js:** Versão 18 ou superior.
* **MongoDB:** É necessário ter uma instância do MongoDB rodando localmente ou um cluster no MongoDB Atlas.

### 2. Instalação

**a. Clone este repositório:**
```bash
git clone https://github.com/PauloMitsi/Projeto-1---backend.git
````

**b. Instale as dependências:**

```bash
npm install
````

### 3\. Configuração do Banco de Dados

**a. Inicie o MongoDB:**
Garanta que seu serviço do MongoDB esteja em execução.

**b. Configure a Conexão:**
Abra o arquivo `/src/config/config.js` e insira a sua string de conexão do MongoDB no campo `MONGODB_URI`.

### 4\. Executando o Projeto

#### Opção A: Executar os Testes Automatizados

Este script irá subir um servidor temporário, rodar uma suíte completa de testes que validam todas as funcionalidades e, ao final, se desligará automaticamente. É a forma mais rápida de verificar a integridade do projeto.

Execute o seguinte comando no terminal:

```bash
node tests/testes.js
```

#### Opção B: Executar o Servidor para a Interface Web

Este script irá iniciar o servidor da API e o manterá no ar, pronto para servir a interface `index.html` e receber requisições.

**a. Inicie o servidor:**

```bash
node src/server.js
```

O terminal exibirá a mensagem `✅ Servidor rodando com sucesso...`. **Mantenha este terminal aberto.**

**b. Abra a interface no navegador:**
Acesse o arquivo **index.html** na pasta "*public/index.html*" e abra um localhost.

Você poderá usar os formulários para indexar sites e realizar buscas em tempo real.

-----

## ✅ Critérios de Avaliação Atendidos

O projeto foi desenvolvido para atender a todos os critérios definidos na proposta da disciplina:

  * [x] **3 Classes de Armazenamento:** `Website`, `PalavraChave` e `Index`. 
  * [x] **Implementação de Casos de Uso:** Funcionalidades de indexação e busca. 
  * [x] **Verificação de Campos Obrigatórios:** Implementada nos controllers e models. 
  * [x] **Tratamento de Exceções:** Blocos `try...catch` em todas as operações críticas. 
  * [x] **Armazenamento de Logs:** Módulo `logger.js` funcional, salvando erros em `/logs/error.log`.  

---

### Autor(es)

  * Paulo Cesar De Oliveira Mitsi - 2410362

