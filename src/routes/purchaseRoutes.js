/**
 * PURCHASE ROUTES - Rotas de Gerenciamento de Compras
 * 
 * Define todas as rotas relacionadas ao gerenciamento de compras
 * com diferentes níveis de acesso (usuário, admin, moderador)
 */

import express from 'express';
import PurchaseController from '../controllers/PurchaseController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const purchaseController = new PurchaseController();

// ===== ROTAS DO USUÁRIO (com autenticação) =====

/**
 * @route   GET /api/purchases/my
 * @desc    Buscar compras do usuário logado
 * @access  Private
 */
router.get('/my', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(purchaseController.getUserPurchases.bind(purchaseController))
);

/**
 * @route   POST /api/purchases
 * @desc    Criar nova compra
 * @access  Private
 */
router.post('/', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(purchaseController.createPurchase.bind(purchaseController))
);

/**
 * @route   GET /api/purchases/:id
 * @desc    Obter compra por ID (própria do usuário)
 * @access  Private
 */
router.get('/:id', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(purchaseController.getPurchaseById.bind(purchaseController))
);

// ===== ROTAS ADMIN (apenas administradores) =====

/**
 * @route   GET /api/purchases
 * @desc    Listar todas as compras com filtros
 * @access  Admin/Moderator
 */
router.get('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(purchaseController.listPurchases.bind(purchaseController))
);

/**
 * @route   GET /api/purchases/stats
 * @desc    Obter estatísticas de compras
 * @access  Admin
 */
router.get('/stats', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.getPurchaseStats.bind(purchaseController))
);

/**
 * @route   GET /api/purchases/period
 * @desc    Buscar compras por período
 * @access  Admin
 */
router.get('/period', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.getPurchasesByPeriod.bind(purchaseController))
);

/**
 * @route   PUT /api/purchases/:id
 * @desc    Atualizar compra
 * @access  Admin
 */
router.put('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.update.bind(purchaseController))
);

/**
 * @route   DELETE /api/purchases/:id
 * @desc    Deletar compra
 * @access  Admin
 */
router.delete('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.delete.bind(purchaseController))
);

// ===== ROTAS DE GERENCIAMENTO DE STATUS =====

/**
 * @route   PATCH /api/purchases/:id/status
 * @desc    Atualizar status da compra
 * @access  Admin/Moderator
 */
router.patch('/:id/status', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin', 'moderator']),
  ErrorHandler.asyncHandler(purchaseController.updatePurchaseStatus.bind(purchaseController))
);

// ===== ROTAS DE GERENCIAMENTO DE ITENS =====

/**
 * @route   POST /api/purchases/:id/items
 * @desc    Adicionar item à compra
 * @access  Admin
 */
router.post('/:id/items', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.addItemToPurchase.bind(purchaseController))
);

/**
 * @route   DELETE /api/purchases/:id/items/:itemId
 * @desc    Remover item da compra
 * @access  Admin
 */
router.delete('/:id/items/:itemId', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.removeItemFromPurchase.bind(purchaseController))
);

// ===== ROTAS DE CONSULTA ADMIN =====

/**
 * @route   GET /api/purchases/:id/with-associations
 * @desc    Obter compra com relacionamentos
 * @access  Admin
 */
router.get('/:id/with-associations', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.findWithAssociations.bind(purchaseController))
);

/**
 * @route   POST /api/purchases/find-by-criteria
 * @desc    Buscar compras por critérios
 * @access  Admin
 */
router.post('/find-by-criteria', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.findByCriteria.bind(purchaseController))
);

/**
 * @route   GET /api/purchases/count
 * @desc    Contar compras
 * @access  Admin
 */
router.get('/count', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(purchaseController.count.bind(purchaseController))
);

export default router;
