/**
 * INDEX.JS - Arquivo Principal da Aplicação
 * 
 * Este arquivo configura o Express e aplica todos os middlewares
 * necessários para a aplicação funcionar corretamente.
 */

import express from 'express';
import dotenv from 'dotenv';
import ErrorHandler from './middleware/errorHandler.js';

// Importar modelos para garantir que estejam disponíveis
import './model/User.js';
import './model/Address.js';
import './model/Books.js';
import './model/Cart.js';
import './model/Purchases.js';
import './model/PurchaseItems.js';
import './model/Image.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// ===== MIDDLEWARES BÁSICOS =====

// Logging de requisições
app.use(ErrorHandler.requestLogger);

// Segurança
app.use(ErrorHandler.security());

// Servir arquivos estáticos (imagens)
app.use('/api/images', express.static('public/images'));

// CORS
app.use(ErrorHandler.cors());

// Timeout de requisições (30 segundos)
app.use(ErrorHandler.timeout(30000));

// Rate limiting básico
app.use(ErrorHandler.rateLimit(100, 15 * 60 * 1000));

// ===== PARSERS =====

// Parser para JSON
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('JSON inválido');
    }
  }
}));

// Parser para dados de formulário
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ===== ROTAS =====

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da API
 *     description: Retorna informações básicas sobre a API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "API Movase - Sistema de Gerenciamento de Livraria"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api/docs"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 * 
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           example:
 *             name: "João Silva"
 *             email: "joao@exemplo.com"
 *             telefone: "(11) 99999-9999"
 *             CPF: "12345678901"
 *             password: "senha123"
 *             dataNascimento: "1990-01-01"
 *             genero: "masculino"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Usuário registrado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email, telefone ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "joao@exemplo.com"
 *             password: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login realizado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     description: Retorna os dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/books:
 *   get:
 *     summary: Listar livros
 *     description: Lista todos os livros disponíveis com paginação
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de livros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 * 
 * /api/books/{id}:
 *   get:
 *     summary: Obter livro por ID
 *     description: Retorna os detalhes de um livro específico
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do livro
 *     responses:
 *       200:
 *         description: Detalhes do livro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: 'API Movase - Sistema de Gerenciamento de Livraria',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// ===== DOCUMENTAÇÃO DA API =====

// Importar configuração do Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

// Servir documentação da API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Movase - Documentação',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Rota para obter especificação JSON da API
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// ===== ROTAS DA API =====

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/cart', cartRoutes);

// ===== MIDDLEWARES DE ERRO =====

// Rota não encontrada (deve vir antes do tratamento de erros)
app.use(ErrorHandler.notFound);

// Tratamento de erros (deve ser o último middleware)
app.use(ErrorHandler.handleError);

export default app;