/**
 * BOOK ROUTES - Rotas de Gerenciamento de Livros
 * 
 * Define todas as rotas relacionadas ao gerenciamento de livros
 * com diferentes níveis de acesso (público, admin, moderador)
 */

import express from 'express';
import BookController from '../controllers/BookController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const bookController = new BookController();

// ===== ROTAS PÚBLICAS (sem autenticação) =====

/**
 * @route   GET /api/books
 * @desc    Listar livros com filtros
 * @access  Public
 */
router.get('/', 
  ErrorHandler.asyncHandler(bookController.listBooks.bind(bookController))
);

/**
 * @route   GET /api/books/:id
 * @desc    Obter livro por ID
 * @access  Public
 */
router.get('/:id', 
  ErrorHandler.asyncHandler(bookController.getBookById.bind(bookController))
);

/**
 * @route   GET /api/books/category/:categoria
 * @desc    Buscar livros por categoria
 * @access  Public
 */
router.get('/category/:categoria', 
  ErrorHandler.asyncHandler(bookController.getBooksByCategory.bind(bookController))
);

/**
 * @route   GET /api/books/author/:autor
 * @desc    Buscar livros por autor
 * @access  Public
 */
router.get('/author/:autor', 
  ErrorHandler.asyncHandler(bookController.getBooksByAuthor.bind(bookController))
);

/**
 * @route   GET /api/books/featured
 * @desc    Buscar livros em destaque
 * @access  Public
 */
router.get('/featured', 
  ErrorHandler.asyncHandler(bookController.getFeaturedBooks.bind(bookController))
);

/**
 * @route   GET /api/books/new
 * @desc    Buscar livros novos
 * @access  Public
 */
router.get('/new', 
  ErrorHandler.asyncHandler(bookController.getNewBooks.bind(bookController))
);

/**
 * @route   GET /api/books/promotional
 * @desc    Buscar livros em promoção
 * @access  Public
 */
router.get('/promotional', 
  ErrorHandler.asyncHandler(bookController.getPromotionalBooks.bind(bookController))
);

/**
 * @route   GET /api/books/similar/:id
 * @desc    Buscar livros similares
 * @access  Public
 */
router.get('/similar/:id', 
  ErrorHandler.asyncHandler(bookController.getSimilarBooks.bind(bookController))
);

/**
 * @route   GET /api/books/search/tags
 * @desc    Buscar livros por tags
 * @access  Public
 */
router.get('/search/tags', 
  ErrorHandler.asyncHandler(bookController.getBooksByTags.bind(bookController))
);

// ===== ROTAS PROTEGIDAS (com autenticação) =====

/**
 * @route   POST /api/books/:id/rating
 * @desc    Avaliar livro
 * @access  Private
 */
router.post('/:id/rating', 
  AuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(bookController.updateRating.bind(bookController))
);

// ===== ROTAS ADMIN (apenas administradores) =====

/**
 * @route   POST /api/books
 * @desc    Criar novo livro
 * @access  Admin
 */
router.post('/', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.createBook.bind(bookController))
);

/**
 * @route   PUT /api/books/:id
 * @desc    Atualizar livro
 * @access  Admin
 */
router.put('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.updateBook.bind(bookController))
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Deletar livro
 * @access  Admin
 */
router.delete('/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.delete.bind(bookController))
);

/**
 * @route   PATCH /api/books/:id/stock
 * @desc    Atualizar estoque do livro
 * @access  Admin
 */
router.patch('/:id/stock', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.updateStock.bind(bookController))
);

/**
 * @route   GET /api/books/stats
 * @desc    Obter estatísticas de livros
 * @access  Admin
 */
router.get('/stats', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.getBookStats.bind(bookController))
);

// ===== ROTAS DE CONSULTA ADMIN =====

/**
 * @route   GET /api/books/:id/with-associations
 * @desc    Obter livro com relacionamentos
 * @access  Admin
 */
router.get('/:id/with-associations', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.findWithAssociations.bind(bookController))
);

/**
 * @route   POST /api/books/find-by-criteria
 * @desc    Buscar livros por critérios
 * @access  Admin
 */
router.post('/find-by-criteria', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.findByCriteria.bind(bookController))
);

/**
 * @route   GET /api/books/count
 * @desc    Contar livros
 * @access  Admin
 */
router.get('/count', 
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(bookController.count.bind(bookController))
);

/**
 * @route   GET /api/books/:id/images
 * @desc    Buscar imagens do livro
 * @access  Public
 */
router.get('/:id/images', 
  ErrorHandler.asyncHandler(bookController.getBookImages.bind(bookController))
);

export default router;
