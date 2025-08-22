# 📚 Documentação da API Movase

## 🎯 Visão Geral

A API Movase é uma API RESTful completa para gerenciamento de uma livraria online. Esta documentação fornece informações detalhadas sobre todos os endpoints disponíveis.

**URL Base**: `http://localhost:3000/api`

**Documentação Interativa**: http://localhost:3000/api/docs

## 🔐 Autenticação

A API utiliza autenticação JWT (JSON Web Tokens). Para endpoints protegidos, inclua o header:

```http
Authorization: Bearer <seu_token_jwt>
```

### Como obter um token:

1. **Registrar usuário** ou **Fazer login**
2. O token será retornado na resposta
3. Use o token nos headers das requisições subsequentes

## 📋 Estrutura de Resposta

Todas as respostas seguem um padrão consistente:

### Sucesso
```json
{
  "success": true,
  "status": 200,
  "message": "Operação realizada com sucesso",
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Erro
```json
{
  "success": false,
  "status": 400,
  "message": "Erro na validação dos dados",
  "errors": ["Campo obrigatório não informado"],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Paginação
```json
{
  "success": true,
  "status": 200,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔐 Endpoints de Autenticação

### POST /api/auth/register

Registra um novo usuário no sistema.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "(11) 99999-9999",
  "CPF": "12345678901",
  "password": "senha123",
  "dataNascimento": "1990-01-01",
  "genero": "masculino"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "status": 201,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "role": "user",
      "status": "ativo"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login

Autentica um usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /api/auth/me

Retorna os dados do usuário autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "CPF": "12345678901",
    "role": "user",
    "status": "ativo"
  }
}
```

### PUT /api/auth/profile

Atualiza o perfil do usuário autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "João Silva Santos",
  "telefone": "(11) 88888-8888",
  "dataNascimento": "1990-01-01",
  "genero": "masculino"
}
```

### POST /api/auth/change-password

Altera a senha do usuário autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

## 👥 Endpoints de Usuários (Admin)

### GET /api/users

Lista todos os usuários (apenas admin).

**Headers:**
```http
Authorization: Bearer <token_admin>
```

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Busca por nome ou email
- `role` (string): Filtrar por role (admin, user, moderator)
- `status` (string): Filtrar por status (ativo, inativo, suspenso)

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "role": "user",
      "status": "ativo",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### GET /api/users/:id

Obtém um usuário específico por ID.

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "(11) 99999-9999",
    "CPF": "12345678901",
    "role": "user",
    "status": "ativo",
    "addresses": [...],
    "purchases": [...]
  }
}
```

### POST /api/users

Cria um novo usuário (apenas admin).

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "telefone": "(11) 77777-7777",
  "CPF": "98765432100",
  "password": "senha123",
  "role": "user",
  "status": "ativo"
}
```

### PUT /api/users/:id

Atualiza um usuário existente.

**Body:**
```json
{
  "name": "Maria Santos Silva",
  "role": "moderator",
  "status": "ativo"
}
```

### DELETE /api/users/:id

Remove um usuário (soft delete).

## 📚 Endpoints de Livros

### GET /api/books

Lista todos os livros (público).

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `search` (string): Busca por título ou autor
- `categoria` (string): Filtrar por categoria
- `precoMin` (number): Preço mínimo
- `precoMax` (number): Preço máximo
- `destaque` (boolean): Apenas livros em destaque
- `novidade` (boolean): Apenas livros novos

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "titulo": "O Poder da Fé",
      "autor": "João Batista",
      "descricao": "Um livro sobre fé e superação",
      "preco": 49.90,
      "estoque": 10,
      "imagemFront": "https://exemplo.com/capa.jpg",
      "categoria": "Religioso",
      "destaque": true,
      "avaliacoes": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

### GET /api/books/:id

Obtém um livro específico por ID.

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": 1,
    "titulo": "O Poder da Fé",
    "autor": "João Batista",
    "descricao": "Um livro sobre fé e superação",
    "sinopse": "História inspiradora sobre fé",
    "isbn": "978-85-123456-7-8",
    "paginas": 200,
    "ano": 2024,
    "editora": "Editora Movase",
    "idioma": "Português",
    "formato": "Físico",
    "peso": 0.5,
    "dimensoes": "16x23cm",
    "categoria": "Religioso",
    "subcategoria": "Fé",
    "tags": ["fé", "superação", "cristianismo"],
    "preco": 49.90,
    "estoque": 10,
    "status": "ativo",
    "destaque": true,
    "novidade": true,
    "imagemFront": "https://exemplo.com/capa.jpg",
    "avaliacoes": 4.5,
    "totalAvaliacoes": 25,
    "vendas": 150
  }
}
```

### POST /api/books

Cria um novo livro (apenas admin/moderador).

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "titulo": "Novo Livro",
  "autor": "Autor Exemplo",
  "descricao": "Descrição do livro",
  "sinopse": "Sinopse detalhada",
  "isbn": "978-85-123456-7-9",
  "paginas": 250,
  "ano": 2024,
  "editora": "Editora Exemplo",
  "idioma": "Português",
  "formato": "Físico",
  "peso": 0.6,
  "dimensoes": "16x23cm",
  "categoria": "Ficção",
  "subcategoria": "Romance",
  "tags": ["ficção", "romance"],
  "preco": 59.90,
  "estoque": 20,
  "destaque": false,
  "novidade": true
}
```

### PUT /api/books/:id

Atualiza um livro existente.

### DELETE /api/books/:id

Remove um livro (soft delete).

## 🛒 Endpoints de Compras

### GET /api/purchases/my

Lista as compras do usuário autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `status` (string): Filtrar por status

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "numero": "PED-2024-001",
      "status": "pendente",
      "subtotal": 49.90,
      "frete": 10.00,
      "total": 59.90,
      "formaPagamento": "pix",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "items": [
        {
          "id": 1,
          "quantidade": 1,
          "precoUnitario": 49.90,
          "precoTotal": 49.90,
          "book": {
            "id": 1,
            "titulo": "O Poder da Fé",
            "autor": "João Batista",
            "imagemFront": "https://exemplo.com/capa.jpg"
          }
        }
      ]
    }
  ]
}
```

### POST /api/purchases

Cria uma nova compra.

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "addressId": 1,
  "items": [
    {
      "bookId": 1,
      "quantidade": 2
    },
    {
      "bookId": 2,
      "quantidade": 1
    }
  ],
  "formaPagamento": "pix",
  "parcelas": 1
}
```

### GET /api/purchases/:id

Obtém uma compra específica.

### PATCH /api/purchases/:id/status

Atualiza o status de uma compra (apenas admin).

**Body:**
```json
{
  "status": "pago"
}
```

## 📍 Endpoints de Endereços

### GET /api/addresses/my

Lista os endereços do usuário autenticado.

**Headers:**
```http
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "cep": "01234567",
      "logradouro": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "tipo": "entrega",
      "principal": true,
      "ativo": true
    }
  ]
}
```

### POST /api/addresses

Cria um novo endereço.

**Headers:**
```http
Authorization: Bearer <token>
```

**Body:**
```json
{
  "cep": "01234567",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "uf": "SP",
  "tipo": "entrega",
  "principal": true
}
```

### PUT /api/addresses/:id

Atualiza um endereço existente.

### DELETE /api/addresses/:id

Remove um endereço.

## 🔍 Endpoints de Busca

### GET /api/books/search

Busca avançada de livros.

**Query Parameters:**
- `q` (string): Termo de busca
- `categoria` (string): Categoria
- `autor` (string): Autor
- `precoMin` (number): Preço mínimo
- `precoMax` (number): Preço máximo
- `ano` (number): Ano de publicação
- `formato` (string): Formato (Físico, Digital, Ambos)
- `sort` (string): Ordenação (preco, titulo, autor, ano)
- `order` (string): Direção (asc, desc)

## 📊 Endpoints de Estatísticas (Admin)

### GET /api/stats/overview

Estatísticas gerais do sistema.

**Headers:**
```http
Authorization: Bearer <token_admin>
```

**Resposta (200):**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "totalUsers": 150,
    "totalBooks": 500,
    "totalPurchases": 75,
    "totalRevenue": 15000.00,
    "monthlyStats": {
      "newUsers": 25,
      "newBooks": 15,
      "newPurchases": 30,
      "revenue": 5000.00
    }
  }
}
```

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito (dados duplicados) |
| 422 | Erro de validação |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

## 🔧 Rate Limiting

A API implementa rate limiting para proteger contra spam:

- **Limite**: 100 requisições por 15 minutos
- **Header de resposta**: `X-RateLimit-Remaining`
- **Quando excedido**: Retorna erro 429

## 🛡️ Segurança

- **HTTPS**: Recomendado em produção
- **CORS**: Configurado para origens específicas
- **Headers de Segurança**: Implementados automaticamente
- **Validação**: Todos os dados são validados
- **Sanitização**: Dados são sanitizados antes do processamento

## 📞 Suporte

Para dúvidas ou problemas:

- **Documentação**: http://localhost:3000/api/docs
- **Email**: contato@movase.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/movase-backend/issues)

---

**Última atualização**: Janeiro 2024
