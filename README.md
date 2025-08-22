# 📚 API Movase - Sistema de Gerenciamento de Livraria

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.37+-orange.svg)](https://sequelize.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-yellow.svg)](https://jwt.io/)

> API RESTful completa para gerenciamento de uma livraria online com autenticação JWT, CRUD completo e sistema de compras.

## 🎯 Sobre o Projeto

A **API Movase** é um sistema backend robusto e escalável desenvolvido para gerenciar uma livraria online completa. O projeto inclui autenticação segura, gerenciamento de usuários, catálogo de livros, sistema de compras e muito mais.

### 🚀 Funcionalidades Principais

- **🔐 Autenticação JWT** - Login seguro com tokens
- **👥 Gerenciamento de Usuários** - Clientes, admins e moderadores
- **📚 Catálogo de Livros** - CRUD completo com busca e filtros
- **🛒 Sistema de Compras** - Pedidos, itens e rastreamento
- **📍 Gerenciamento de Endereços** - Múltiplos endereços por usuário
- **🔍 Busca Avançada** - Filtros por categoria, preço, autor
- **📊 Dashboard Admin** - Estatísticas e gerenciamento
- **✅ Validações Robustas** - Validação de dados em todas as operações
- **🛡️ Segurança** - Rate limiting, CORS, headers de segurança

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação com tokens
- **bcrypt** - Criptografia de senhas
- **Swagger** - Documentação da API

### Ferramentas de Desenvolvimento
- **Nodemon** - Hot reload em desenvolvimento
- **ESLint** - Linting de código
- **Jest** - Testes unitários
- **Docker** - Containerização

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 14 ou superior)
- **npm** ou **yarn**

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/movase-backend.git
cd movase-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movase
DB_USER=postgres
DB_PASS=0000

# Configurações JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Configurações de Segurança
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configure o banco de dados

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE movase;

# Saia do psql
\q
```

### 5. Execute as migrações

```bash
# Teste a sincronização dos modelos
npm run test:sync
```

### 6. Inicie o servidor

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI:

- **📖 Documentação Interativa**: http://localhost:3000/api/docs
- **📄 Especificação JSON**: http://localhost:3000/api/docs.json

### 🔐 Autenticação

Para usar endpoints protegidos, inclua o header de autorização:

```http
Authorization: Bearer <seu_token_jwt>
```

### 📝 Exemplo de Uso

```bash
# 1. Registrar um usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "CPF": "12345678901",
    "password": "senha123"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'

# 3. Usar o token para acessar endpoints protegidos
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <seu_token_aqui>"
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Teste de sincronização do banco

```bash
npm run test:sync
```

### Teste do servidor

```bash
npm run test:server
```

## 📊 Estrutura do Projeto

```
Movase-Backend/
├── src/
│   ├── config/           # Configurações (banco, swagger, etc.)
│   ├── controllers/      # Controladores da aplicação
│   ├── database/         # Conexão e sincronização do banco
│   ├── middleware/       # Middlewares (auth, error handling)
│   ├── model/           # Modelos do Sequelize
│   ├── routes/          # Rotas da API
│   ├── utils/           # Utilitários (validação, response)
│   ├── index.js         # Configuração principal do Express
│   └── server.js        # Inicialização do servidor
├── test-sync.js         # Script de teste de sincronização
├── package.json         # Dependências e scripts
└── README.md           # Este arquivo
```

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor em produção |
| `npm run dev` | Inicia o servidor em desenvolvimento com hot reload |
| `npm test` | Executa todos os testes |
| `npm run test:sync` | Testa a sincronização do banco de dados |
| `npm run test:server` | Testa o servidor |

## 📈 Endpoints Principais

### 🔐 Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/change-password` - Alterar senha

### 👥 Usuários (Admin)
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário específico
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### 📚 Livros
- `GET /api/books` - Listar livros (público)
- `GET /api/books/:id` - Obter livro específico
- `POST /api/books` - Criar livro (admin)
- `PUT /api/books/:id` - Atualizar livro (admin)
- `DELETE /api/books/:id` - Deletar livro (admin)

### 🛒 Compras
- `GET /api/purchases/my` - Minhas compras
- `POST /api/purchases` - Criar compra
- `GET /api/purchases/:id` - Obter compra específica
- `PATCH /api/purchases/:id/status` - Atualizar status (admin)

### 📍 Endereços
- `GET /api/addresses/my` - Meus endereços
- `POST /api/addresses` - Criar endereço
- `PUT /api/addresses/:id` - Atualizar endereço
- `DELETE /api/addresses/:id` - Deletar endereço

## 🔐 Controle de Acesso

O sistema possui diferentes níveis de acesso:

- **👤 Cliente (user)** - Acesso básico ao catálogo e suas compras
- **👨‍💼 Moderador (moderator)** - Gerenciamento de conteúdo
- **👑 Administrador (admin)** - Acesso total ao sistema

## 🛡️ Segurança

- **JWT Tokens** - Autenticação segura
- **bcrypt** - Senhas criptografadas
- **Rate Limiting** - Proteção contra spam
- **CORS** - Controle de origens
- **Validação de Dados** - Sanitização de entrada
- **Headers de Segurança** - Proteção contra ataques

## 📊 Banco de Dados

### Entidades Principais

- **Users** - Usuários do sistema
- **Books** - Catálogo de livros
- **Addresses** - Endereços dos usuários
- **Purchases** - Pedidos de compra
- **PurchaseItems** - Itens dos pedidos

### Relacionamentos

- Um usuário pode ter múltiplos endereços
- Um usuário pode ter múltiplas compras
- Uma compra pode ter múltiplos itens
- Cada item está associado a um livro

## 🚀 Deploy

### Docker

```bash
# Construir imagem
docker build -t movase-backend .

# Executar container
docker run -p 3000:3000 movase-backend
```

### PM2 (Produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start src/server.js --name "movase-backend"

# Monitorar
pm2 monit
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: contato@movase.com
- **Documentação**: http://localhost:3000/api/docs
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/movase-backend/issues)

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade Node.js
- Contribuidores do projeto

---

**Desenvolvido com ❤️ pela Equipe Movase**