/**
 * ADDRESS ROUTES - Rotas de Gerenciamento de Endereços
 * 
 * Define todas as rotas relacionadas ao gerenciamento de endereços
 * com diferentes níveis de acesso (usuário, admin, moderador)
 */

import express from 'express';
import AddressController from '../controllers/AddressController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const addressController = new AddressController();

// ===== ROTAS DO USUÁRIO (com autenticação) =====

/**
 * @route   GET /api/addresses/my
 * @desc    Listar endereços do usuário logado
 * @access  Private
 */
router.get('/my', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.getUserAddresses.bind(addressController))
);

/**
 * @route   GET /api/addresses/my/main
 * @desc    Buscar endereço principal do usuário
 * @access  Private
 */
router.get('/my/main', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.getMainAddress.bind(addressController))
);

/**
 * @route   POST /api/addresses
 * @desc    Criar novo endereço para o usuário
 * @access  Private
 */
router.post('/', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.createUserAddress.bind(addressController))
);

/**
 * @route   GET /api/addresses/:id
 * @desc    Buscar endereço por ID (próprio do usuário)
 * @access  Private
 */
router.get('/:id', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.getUserAddressById.bind(addressController))
);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Atualizar endereço do usuário
 * @access  Private
 */
router.put('/:id', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.updateUserAddress.bind(addressController))
);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Deletar endereço do usuário
 * @access  Private
 */
router.delete('/:id', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.deleteUserAddress.bind(addressController))
);

/**
 * @route   PATCH /api/addresses/:id/main
 * @desc    Definir endereço como principal
 * @access  Private
 */
router.patch('/:id/main', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(addressController.setMainAddress.bind(addressController))
);

// ===== ROTAS ADMIN (apenas administradores) =====

/**
 * @route   GET /api/addresses
 * @desc    Listar todos os endereços com filtros
 * @access  Admin/Moderator
 */
router.get('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(addressController.list.bind(addressController))
);

/**
 * @route   GET /api/addresses/stats
 * @desc    Obter estatísticas de endereços
 * @access  Admin
 */
router.get('/stats', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(addressController.getAddressStats.bind(addressController))
);

/**
 * @route   GET /api/addresses/cep/:cep
 * @desc    Buscar endereços por CEP
 * @access  Admin/Moderator
 */
router.get('/cep/:cep', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(addressController.getAddressesByCEP.bind(addressController))
);

/**
 * @route   GET /api/addresses/city/:cidade
 * @desc    Buscar endereços por cidade
 * @access  Admin/Moderator
 */
router.get('/city/:cidade', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(addressController.getAddressesByCity.bind(addressController))
);

/**
 * @route   GET /api/addresses/state/:uf
 * @desc    Buscar endereços por UF
 * @access  Admin/Moderator
 */
router.get('/state/:uf', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(addressController.getAddressesByState.bind(addressController))
);

/**
 * @route   GET /api/addresses/type/:tipo
 * @desc    Buscar endereços por tipo
 * @access  Admin/Moderator
 */
router.get('/type/:tipo', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(addressController.getAddressesByType.bind(addressController))
);

// ===== ROTAS PÚBLICAS (sem autenticação) =====

/**
 * @route   GET /api/addresses/validate/:cep
 * @desc    Validar CEP
 * @access  Public
 */
router.get('/validate/:cep', 
  ErrorHandler.asyncHandler(addressController.validateCEP.bind(addressController))
);

// ===== ROTAS DE CONSULTA ADMIN =====

/**
 * @route   GET /api/addresses/:id/with-associations
 * @desc    Obter endereço com relacionamentos
 * @access  Admin
 */
router.get('/:id/with-associations', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(addressController.findWithAssociations.bind(addressController))
);

/**
 * @route   POST /api/addresses/find-by-criteria
 * @desc    Buscar endereços por critérios
 * @access  Admin
 */
router.post('/find-by-criteria', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(addressController.findByCriteria.bind(addressController))
);

/**
 * @route   GET /api/addresses/count
 * @desc    Contar endereços
 * @access  Admin
 */
router.get('/count', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(addressController.count.bind(addressController))
);

export default router;
