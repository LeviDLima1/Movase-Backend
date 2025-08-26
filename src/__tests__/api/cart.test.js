/**
 * CART API TESTS - Testes de API
 * 
 * Testes para endpoints do carrinho de compras
 */

import request from 'supertest';
import express from 'express';
import cartRoutes from '../../routes/cartRoutes.js';
import CartController from '../../controllers/CartController.js';

// Mock do CartController
jest.mock('../../controllers/CartController.js');

// Mock do middleware de erro
jest.mock('../../middleware/errorHandler.js', () => ({
  asyncHandler: (fn) => fn
}));

// Mock do middleware de autenticação
jest.mock('../../middleware/authMiddleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
  },
  requireRole: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/cart', cartRoutes);

describe('Cart API Endpoints', () => {
  let mockCartController;

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
    
    // Criar mock do CartController
    mockCartController = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      recalculateCart: jest.fn(),
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
      getCartSummary: jest.fn(),
      validateCart: jest.fn(),
      mergeCarts: jest.fn(),
      saveForLater: jest.fn(),
      getSavedItems: jest.fn(),
      moveToCart: jest.fn(),
      removeSavedItem: jest.fn()
    };

    // Configurar mock do CartController
    CartController.mockImplementation(() => mockCartController);
  });

  describe('GET /api/cart', () => {
    test('deve retornar carrinho do usuário', async () => {
      const mockCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            bookId: 1,
            quantity: 2,
            price: 29.90,
            book: {
              id: 1,
              titulo: 'Livro Teste 1',
              autor: 'Autor Teste 1',
              preco: 29.90
            }
          }
        ],
        total: 59.80,
        itemCount: 2
      };

      const mockResponse = {
        success: true,
        data: mockCart
      };

      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.getCart).toHaveBeenCalled();
    });

    test('deve retornar carrinho vazio quando não há itens', async () => {
      const mockCart = {
        id: 1,
        userId: 1,
        items: [],
        total: 0,
        itemCount: 0
      };

      const mockResponse = {
        success: true,
        data: mockCart
      };

      mockCartController.getCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('POST /api/cart/add', () => {
    test('deve adicionar item ao carrinho', async () => {
      const itemData = {
        bookId: 1,
        quantity: 2
      };

      const mockCartItem = {
        id: 1,
        bookId: 1,
        quantity: 2,
        price: 29.90,
        book: {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90
        }
      };

      const mockResponse = {
        success: true,
        data: mockCartItem,
        message: 'Item adicionado ao carrinho'
      };

      mockCartController.addItem.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/add')
        .send(itemData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.addItem).toHaveBeenCalled();
    });

    test('deve retornar erro para dados inválidos', async () => {
      const invalidData = {
        bookId: 'invalid',
        quantity: -1
      };

      mockCartController.addItem.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: ['ID do livro deve ser um número', 'Quantidade deve ser positiva']
        });
      });

      const response = await request(app)
        .post('/api/cart/add')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('deve retornar erro quando livro não existe', async () => {
      const itemData = {
        bookId: 999,
        quantity: 1
      };

      mockCartController.addItem.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Livro não encontrado'
        });
      });

      const response = await request(app)
        .post('/api/cart/add')
        .send(itemData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Livro não encontrado');
    });

    test('deve retornar erro quando estoque insuficiente', async () => {
      const itemData = {
        bookId: 1,
        quantity: 100
      };

      mockCartController.addItem.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Estoque insuficiente',
          availableStock: 10
        });
      });

      const response = await request(app)
        .post('/api/cart/add')
        .send(itemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Estoque insuficiente');
    });
  });

  describe('PUT /api/cart/update/:itemId', () => {
    test('deve atualizar quantidade do item', async () => {
      const updateData = {
        quantity: 3
      };

      const mockCartItem = {
        id: 1,
        bookId: 1,
        quantity: 3,
        price: 29.90,
        book: {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90
        }
      };

      const mockResponse = {
        success: true,
        data: mockCartItem,
        message: 'Item atualizado com sucesso'
      };

      mockCartController.updateItem.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/cart/update/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.updateItem).toHaveBeenCalled();
    });

    test('deve retornar erro para quantidade inválida', async () => {
      const updateData = {
        quantity: 0
      };

      mockCartController.updateItem.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Quantidade deve ser maior que zero'
        });
      });

      const response = await request(app)
        .put('/api/cart/update/1')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve retornar erro para item não encontrado', async () => {
      const updateData = {
        quantity: 2
      };

      mockCartController.updateItem.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Item não encontrado no carrinho'
        });
      });

      const response = await request(app)
        .put('/api/cart/update/999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/remove/:itemId', () => {
    test('deve remover item do carrinho', async () => {
      const mockResponse = {
        success: true,
        message: 'Item removido do carrinho'
      };

      mockCartController.removeItem.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/cart/remove/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.removeItem).toHaveBeenCalled();
    });

    test('deve retornar erro para item não encontrado', async () => {
      mockCartController.removeItem.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Item não encontrado no carrinho'
        });
      });

      const response = await request(app)
        .delete('/api/cart/remove/999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/clear', () => {
    test('deve limpar todo o carrinho', async () => {
      const mockResponse = {
        success: true,
        message: 'Carrinho limpo com sucesso'
      };

      mockCartController.clearCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/cart/clear')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.clearCart).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/recalculate', () => {
    test('deve recalcular valores do carrinho', async () => {
      const mockCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            bookId: 1,
            quantity: 2,
            price: 29.90,
            subtotal: 59.80
          }
        ],
        subtotal: 59.80,
        discount: 5.98,
        total: 53.82,
        itemCount: 2
      };

      const mockResponse = {
        success: true,
        data: mockCart,
        message: 'Carrinho recalculado com sucesso'
      };

      mockCartController.recalculateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/recalculate')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.recalculateCart).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/coupon', () => {
    test('deve aplicar cupom de desconto', async () => {
      const couponData = {
        code: 'DESCONTO10'
      };

      const mockCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            bookId: 1,
            quantity: 2,
            price: 29.90,
            subtotal: 59.80
          }
        ],
        subtotal: 59.80,
        discount: 5.98,
        total: 53.82,
        coupon: {
          code: 'DESCONTO10',
          discount: 10
        }
      };

      const mockResponse = {
        success: true,
        data: mockCart,
        message: 'Cupom aplicado com sucesso'
      };

      mockCartController.applyCoupon.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/coupon')
        .send(couponData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.applyCoupon).toHaveBeenCalled();
    });

    test('deve retornar erro para cupom inválido', async () => {
      const couponData = {
        code: 'CUPOMINVALIDO'
      };

      mockCartController.applyCoupon.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Cupom inválido ou expirado'
        });
      });

      const response = await request(app)
        .post('/api/cart/coupon')
        .send(couponData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cart/coupon', () => {
    test('deve remover cupom do carrinho', async () => {
      const mockResponse = {
        success: true,
        message: 'Cupom removido com sucesso'
      };

      mockCartController.removeCoupon.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/cart/coupon')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.removeCoupon).toHaveBeenCalled();
    });
  });

  describe('GET /api/cart/summary', () => {
    test('deve retornar resumo do carrinho', async () => {
      const mockSummary = {
        itemCount: 2,
        subtotal: 59.80,
        discount: 5.98,
        total: 53.82,
        shipping: 10.00,
        finalTotal: 63.82
      };

      const mockResponse = {
        success: true,
        data: mockSummary
      };

      mockCartController.getCartSummary.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart/summary')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.getCartSummary).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/validate', () => {
    test('deve validar carrinho com sucesso', async () => {
      const mockValidation = {
        isValid: true,
        issues: [],
        warnings: []
      };

      const mockResponse = {
        success: true,
        data: mockValidation
      };

      mockCartController.validateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/validate')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.validateCart).toHaveBeenCalled();
    });

    test('deve retornar problemas de validação', async () => {
      const mockValidation = {
        isValid: false,
        issues: [
          'Item "Livro Teste 1" está fora de estoque',
          'Preço do item "Livro Teste 2" foi alterado'
        ],
        warnings: [
          'Quantidade alta para item "Livro Teste 3"'
        ]
      };

      const mockResponse = {
        success: true,
        data: mockValidation
      };

      mockCartController.validateCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/validate')
        .expect(200);

      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.issues).toHaveLength(2);
    });
  });

  describe('POST /api/cart/merge', () => {
    test('deve mesclar carrinhos', async () => {
      const mergeData = {
        guestCart: [
          {
            bookId: 2,
            quantity: 1
          }
        ]
      };

      const mockCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            bookId: 1,
            quantity: 2
          },
          {
            id: 2,
            bookId: 2,
            quantity: 1
          }
        ],
        total: 89.70
      };

      const mockResponse = {
        success: true,
        data: mockCart,
        message: 'Carrinhos mesclados com sucesso'
      };

      mockCartController.mergeCarts.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/merge')
        .send(mergeData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.mergeCarts).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/save-for-later/:itemId', () => {
    test('deve salvar item para depois', async () => {
      const mockSavedItem = {
        id: 1,
        userId: 1,
        bookId: 1,
        book: {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90
        }
      };

      const mockResponse = {
        success: true,
        data: mockSavedItem,
        message: 'Item salvo para depois'
      };

      mockCartController.saveForLater.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/save-for-later/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.saveForLater).toHaveBeenCalled();
    });
  });

  describe('GET /api/cart/saved', () => {
    test('deve retornar itens salvos para depois', async () => {
      const mockSavedItems = [
        {
          id: 1,
          userId: 1,
          bookId: 1,
          book: {
            id: 1,
            titulo: 'Livro Teste 1',
            autor: 'Autor Teste 1',
            preco: 29.90
          }
        }
      ];

      const mockResponse = {
        success: true,
        data: mockSavedItems
      };

      mockCartController.getSavedItems.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/cart/saved')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.getSavedItems).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/move-to-cart/:itemId', () => {
    test('deve mover item salvo para o carrinho', async () => {
      const mockResponse = {
        success: true,
        message: 'Item movido para o carrinho'
      };

      mockCartController.moveToCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/cart/move-to-cart/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.moveToCart).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/cart/saved/:itemId', () => {
    test('deve remover item salvo', async () => {
      const mockResponse = {
        success: true,
        message: 'Item removido da lista de salvos'
      };

      mockCartController.removeSavedItem.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/cart/saved/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockCartController.removeSavedItem).toHaveBeenCalled();
    });
  });
});
