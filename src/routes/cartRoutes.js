/**
 * CART ROUTES - Rotas do Carrinho de Compras
 * 
 * Define todas as rotas relacionadas ao carrinho de compras
 */

import express from 'express';
import CartController from '../controllers/CartController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const cartController = CartController;

// ===== ROTAS PÚBLICAS =====

// ===== ROTAS AUTENTICADAS =====

/**
 * @route   GET /api/cart
 * @desc    Obter carrinho do usuário
 * @access  Private
 */
router.get('/', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(cartController.getUserCart.bind(cartController))
);

/**
 * @route   POST /api/cart/items
 * @desc    Adicionar item ao carrinho
 * @access  Private
 */
router.post('/items', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(cartController.addItem.bind(cartController))
);

/**
 * @route   PUT /api/cart/items
 * @desc    Atualizar quantidade de item
 * @access  Private
 */
router.put('/items', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(cartController.updateItemQuantity.bind(cartController))
);

/**
 * @route   DELETE /api/cart/items/:bookId
 * @desc    Remover item do carrinho
 * @access  Private
 */
router.delete('/items/:bookId', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(cartController.removeItem.bind(cartController))
);

/**
 * @route   DELETE /api/cart
 * @desc    Limpar carrinho
 * @access  Private
 */
router.delete('/', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(cartController.clearCart.bind(cartController))
);

export default router;
