/**
 * AUTH ROUTES - Rotas de Autenticação
 * 
 * Define todas as rotas relacionadas à autenticação e gerenciamento
 * de usuários (registro, login, perfil, etc.)
 */

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const authController = new AuthController();

// ===== ROTAS PÚBLICAS (sem autenticação) =====

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 * @swagger
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
 */
router.post('/register', 
  ErrorHandler.asyncHandler(authController.register.bind(authController))
);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 * @swagger
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
 *       403:
 *         description: Conta desativada ou bloqueada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', 
  ErrorHandler.asyncHandler(authController.login.bind(authController))
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperação de senha
 * @access  Public
 */
router.post('/forgot-password', 
  ErrorHandler.asyncHandler(authController.forgotPassword.bind(authController))
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resetar senha com token
 * @access  Public
 */
router.post('/reset-password', 
  ErrorHandler.asyncHandler(authController.resetPassword.bind(authController))
);

/**
 * @route   GET /api/auth/check-email/:email
 * @desc    Verificar se email está disponível
 * @access  Public
 */
router.get('/check-email/:email', 
  ErrorHandler.asyncHandler(authController.checkEmail.bind(authController))
);

/**
 * @route   GET /api/auth/check-phone/:telefone
 * @desc    Verificar se telefone está disponível
 * @access  Public
 */
router.get('/check-phone/:telefone', 
  ErrorHandler.asyncHandler(authController.checkPhone.bind(authController))
);

/**
 * @route   GET /api/auth/check-cpf/:CPF
 * @desc    Verificar se CPF está disponível
 * @access  Public
 */
router.get('/check-cpf/:CPF', 
  ErrorHandler.asyncHandler(authController.checkCPF.bind(authController))
);

// ===== ROTAS PROTEGIDAS (com autenticação) =====

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário logado
 * @access  Private
 * @swagger
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
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.me.bind(authController))
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.put('/profile', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.updateProfile.bind(authController))
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.put('/change-password', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.changePassword.bind(authController))
);

/**
 * @route   GET /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.get('/logout', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.logout.bind(authController))
);

// ===== ROTAS ADMIN (apenas administradores) =====

/**
 * @route   GET /api/auth/verify-email/:id
 * @desc    Verificar email de um usuário (admin)
 * @access  Admin
 */
router.get('/verify-email/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(authController.verifyEmail.bind(authController))
);

/**
 * @route   GET /api/auth/verify-phone/:id
 * @desc    Verificar telefone de um usuário (admin)
 * @access  Admin
 */
router.get('/verify-phone/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(authController.verifyPhone.bind(authController))
);

export default router;
