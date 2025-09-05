/**
 * USER ROUTES - Rotas de Gerenciamento de Usuários
 * 
 * Define todas as rotas relacionadas ao gerenciamento de usuários
 * com diferentes níveis de acesso (admin, moderador, usuário)
 */

import express from 'express';
import UserController from '../controllers/UserController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const userController = new UserController();

// ===== ROTAS ADMIN (apenas administradores) =====

/**
 * @route   GET /api/users
 * @desc    Listar todos os usuários com filtros
 * @access  Admin/Moderator
 */
router.get('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.listUsers.bind(userController))
);

/**
 * @route   GET /api/users/stats
 * @desc    Obter estatísticas de usuários
 * @access  Admin
 */
router.get('/stats', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.getUserStats.bind(userController))
);

/**
 * @route   POST /api/users
 * @desc    Criar novo usuário (admin)
 * @access  Admin
 */
router.post('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.createUser.bind(userController))
);

/**
 * @route   POST /api/users/search
 * @desc    Buscar usuários por critérios específicos
 * @access  Admin/Moderator
 */
router.post('/search', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.searchUsers.bind(userController))
);

/**
 * @route   GET /api/users/export
 * @desc    Exportar dados de usuários
 * @access  Admin
 */
router.get('/export', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.exportUsers.bind(userController))
);

// ===== ROTAS ESPECÍFICAS DE USUÁRIO =====

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Admin/Moderator ou próprio usuário
 */
router.get('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.getUserById.bind(userController))
);

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar usuário
 * @access  Admin
 */
router.put('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.updateUser.bind(userController))
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deletar usuário
 * @access  Admin
 */
router.delete('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.delete.bind(userController))
);

// ===== ROTAS DE GERENCIAMENTO DE STATUS =====

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Alterar status do usuário
 * @access  Admin/Moderator
 */
router.patch('/:id/status', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.changeUserStatus.bind(userController))
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Alterar role do usuário
 * @access  Admin
 */
router.patch('/:id/role', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(userController.changeUserRole.bind(userController))
);

// ===== ROTAS DE VERIFICAÇÃO =====

/**
 * @route   PATCH /api/users/:id/verify-email
 * @desc    Verificar email do usuário
 * @access  Admin/Moderator
 */
router.patch('/:id/verify-email', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.verifyEmail.bind(userController))
);

/**
 * @route   PATCH /api/users/:id/verify-phone
 * @desc    Verificar telefone do usuário
 * @access  Admin/Moderator
 */
router.patch('/:id/verify-phone', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.verifyPhone.bind(userController))
);

// ===== ROTAS DE CONSULTA =====

/**
 * @route   GET /api/users/:id/with-associations
 * @desc    Obter usuário com relacionamentos
 * @access  Admin/Moderator
 */
router.get('/:id/with-associations', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.findWithAssociations.bind(userController))
);

/**
 * @route   POST /api/users/find-by-criteria
 * @desc    Buscar usuários por critérios
 * @access  Admin/Moderator
 */
router.post('/find-by-criteria', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.findByCriteria.bind(userController))
);

/**
 * @route   GET /api/users/count
 * @desc    Contar usuários
 * @access  Admin/Moderator
 */
router.get('/count', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(userController.count.bind(userController))
);

// ===== ROTA PÚBLICA PARA ADMIN (TEMPORÁRIA) =====

/**
 * @route   GET /api/users/admin
 * @desc    Listar usuários para admin sem autenticação (temporário)
 * @access  Public (TEMPORÁRIO - REMOVER EM PRODUÇÃO)
 */
router.get('/admin', async (req, res) => {
  try {
    // Buscar usuários diretamente do banco
    const { User } = await import('../model/User.js');
    const { Address } = await import('../model/Address.js');
    const { Purchase } = await import('../model/Purchase.js');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Address,
          as: 'addresses',
          required: false
        },
        {
          model: Purchase,
          as: 'purchases',
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: users.rows,
      pagination: {
        page,
        limit,
        total: users.count,
        totalPages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
