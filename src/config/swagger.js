/**
 * SWAGGER CONFIG - Configuração da Documentação da API
 * 
 * Configura o Swagger/OpenAPI para gerar documentação automática
 * das rotas da API Movase.
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Movase - Sistema de Gerenciamento de Livraria',
      version: '1.0.0',
      description: `
        ## 📚 API Movase - Sistema Completo de Livraria

        ### 🎯 Sobre o Projeto
        API RESTful para gerenciamento completo de uma livraria online, incluindo:
        - Autenticação e gerenciamento de usuários
        - Catálogo de livros com busca e filtros
        - Sistema de compras e pedidos
        - Gerenciamento de endereços
        - Dashboard administrativo

        ### 🚀 Funcionalidades Principais
        - **Autenticação JWT** - Login seguro com tokens
        - **CRUD Completo** - Operações para todas as entidades
        - **Validações** - Validação robusta de dados
        - **Relacionamentos** - Conexões entre usuários, livros, pedidos
        - **Filtros Avançados** - Busca e paginação
        - **Controle de Acesso** - Diferentes níveis de permissão

        ### 📊 Entidades do Sistema
        - **Users** - Usuários (clientes, admins, moderadores)
        - **Books** - Catálogo de livros
        - **Addresses** - Endereços dos usuários
        - **Purchases** - Pedidos de compra
        - **PurchaseItems** - Itens dos pedidos

        ### 🔐 Autenticação
        Para usar endpoints protegidos, inclua o header:
        \`\`\`
        Authorization: Bearer <seu_token_jwt>
        \`\`\`

        ### 📝 Como Usar
        1. Faça login em \`POST /api/auth/login\`
        2. Use o token retornado nos headers das requisições
        3. Explore os endpoints disponíveis abaixo

        ### 🛠️ Tecnologias
        - **Node.js** - Runtime JavaScript
        - **Express** - Framework web
        - **Sequelize** - ORM para PostgreSQL
        - **JWT** - Autenticação
        - **bcrypt** - Criptografia de senhas
      `,
      contact: {
        name: 'Equipe Movase',
        email: 'contato@movase.com',
        url: 'https://movase.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.movase.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      schemas: {
        // Schemas de Usuário
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
            telefone: { type: 'string', example: '(11) 99999-9999' },
            CPF: { type: 'string', example: '12345678901' },
            role: { 
              type: 'string', 
              enum: ['admin', 'user', 'moderator'],
              example: 'user'
            },
            status: { 
              type: 'string', 
              enum: ['ativo', 'inativo', 'suspenso', 'pendente'],
              example: 'ativo'
            },
            dataNascimento: { type: 'string', format: 'date', example: '1990-01-01' },
            genero: { 
              type: 'string', 
              enum: ['masculino', 'feminino', 'outro', 'prefiro_nao_dizer'],
              example: 'masculino'
            },
            emailVerificado: { type: 'boolean', example: false },
            telefoneVerificado: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserCreate: {
          type: 'object',
          required: ['name', 'email', 'telefone', 'CPF', 'password'],
          properties: {
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
            telefone: { type: 'string', example: '(11) 99999-9999' },
            CPF: { type: 'string', example: '12345678901' },
            password: { type: 'string', example: 'senha123' },
            dataNascimento: { type: 'string', format: 'date', example: '1990-01-01' },
            genero: { 
              type: 'string', 
              enum: ['masculino', 'feminino', 'outro', 'prefiro_nao_dizer']
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
            password: { type: 'string', example: 'senha123' }
          }
        },
        // Schemas de Livro
        Book: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            titulo: { type: 'string', example: 'O Poder da Fé' },
            autor: { type: 'string', example: 'João Batista' },
            descricao: { type: 'string', example: 'Um livro sobre fé e superação' },
            sinopse: { type: 'string', example: 'História inspiradora sobre fé' },
            isbn: { type: 'string', example: '978-85-123456-7-8' },
            paginas: { type: 'integer', example: 200 },
            ano: { type: 'integer', example: 2024 },
            editora: { type: 'string', example: 'Editora Movase' },
            idioma: { type: 'string', example: 'Português' },
            formato: { 
              type: 'string', 
              enum: ['Físico', 'Digital', 'Ambos'],
              example: 'Físico'
            },
            peso: { type: 'number', format: 'float', example: 0.5 },
            dimensoes: { type: 'string', example: '16x23cm' },
            categoria: { type: 'string', example: 'Religioso' },
            subcategoria: { type: 'string', example: 'Fé' },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['fé', 'superação', 'cristianismo']
            },
            preco: { type: 'number', format: 'float', example: 49.90 },
            estoque: { type: 'integer', example: 10 },
            status: { 
              type: 'string', 
              enum: ['ativo', 'inativo'],
              example: 'ativo'
            },
            destaque: { type: 'boolean', example: true },
            novidade: { type: 'boolean', example: true },
            imagemFront: { type: 'string', example: 'https://exemplo.com/capa.jpg' },
            avaliacoes: { type: 'number', format: 'float', example: 4.5 },
            totalAvaliacoes: { type: 'integer', example: 25 },
            vendas: { type: 'integer', example: 150 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Endereço
        Address: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            cep: { type: 'string', example: '01234567' },
            logradouro: { type: 'string', example: 'Rua das Flores' },
            numero: { type: 'string', example: '123' },
            complemento: { type: 'string', example: 'Apto 45' },
            bairro: { type: 'string', example: 'Centro' },
            cidade: { type: 'string', example: 'São Paulo' },
            uf: { type: 'string', example: 'SP' },
            tipo: { 
              type: 'string', 
              enum: ['entrega', 'cobranca'],
              example: 'entrega'
            },
            principal: { type: 'boolean', example: true },
            ativo: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Compra
        Purchase: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            addressId: { type: 'integer', example: 1 },
            numero: { type: 'string', example: 'PED-2024-001' },
            status: { 
              type: 'string', 
              enum: ['pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado', 'devolvido'],
              example: 'pendente'
            },
            subtotal: { type: 'number', format: 'float', example: 49.90 },
            frete: { type: 'number', format: 'float', example: 10.00 },
            desconto: { type: 'number', format: 'float', example: 0 },
            total: { type: 'number', format: 'float', example: 59.90 },
            formaPagamento: { 
              type: 'string', 
              enum: ['pix', 'boleto', 'cartao'],
              example: 'pix'
            },
            parcelas: { type: 'integer', example: 1 },
            codigoRastreamento: { type: 'string', example: 'BR123456789BR' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Item de Compra
        PurchaseItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            purchaseId: { type: 'integer', example: 1 },
            bookId: { type: 'integer', example: 1 },
            quantidade: { type: 'integer', example: 1 },
            precoUnitario: { type: 'number', format: 'float', example: 49.90 },
            precoTotal: { type: 'number', format: 'float', example: 49.90 },
            desconto: { type: 'number', format: 'float', example: 0 },
            precoFinal: { type: 'number', format: 'float', example: 49.90 },
            status: { 
              type: 'string', 
              enum: ['pendente', 'preparando', 'enviado', 'entregue', 'cancelado', 'devolvido'],
              example: 'pendente'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Resposta
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operação realizada com sucesso' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Erro na validação dos dados' },
            errors: { 
              type: 'array',
              items: { type: 'string' },
              example: ['Campo obrigatório não informado']
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 100 },
                pages: { type: 'integer', example: 10 }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Info',
        description: 'Informações gerais da API'
      },
      {
        name: 'Auth',
        description: 'Endpoints de autenticação e gerenciamento de usuários'
      },
      {
        name: 'Users',
        description: 'Gerenciamento de usuários (admin)'
      },
      {
        name: 'Books',
        description: 'Gerenciamento do catálogo de livros'
      },
      {
        name: 'Addresses',
        description: 'Gerenciamento de endereços dos usuários'
      },
      {
        name: 'Purchases',
        description: 'Gerenciamento de compras e pedidos'
      },
      {
        name: 'Email',
        description: 'Sistema de envio de emails e notificações'
      }
    ]
  },
  apis: [
    'src/index.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;
