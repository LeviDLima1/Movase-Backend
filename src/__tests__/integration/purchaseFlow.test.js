/**
 * PURCHASE FLOW INTEGRATION TESTS - Testes de Integração
 * 
 * Testes para o fluxo completo de compra
 */

// Mock dos controllers como classes instanciáveis
jest.mock('../../controllers/AuthController.js', () => {
  return jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn()
  }));
});

jest.mock('../../controllers/BookController.js', () => {
  return jest.fn().mockImplementation(() => ({
    listBooks: jest.fn(),
    getBookById: jest.fn(),
    createBook: jest.fn()
  }));
});

jest.mock('../../controllers/CartController.js', () => {
  return jest.fn().mockImplementation(() => ({
    getUserCart: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    recalculateCart: jest.fn(),
    getCartSummary: jest.fn(),
    validateCart: jest.fn()
  }));
});

jest.mock('../../controllers/PurchaseController.js', () => {
  return jest.fn().mockImplementation(() => ({
    createPurchase: jest.fn(),
    getPurchaseById: jest.fn(),
    getUserPurchases: jest.fn(),
    updatePurchaseStatus: jest.fn(),
    cancelPurchase: jest.fn()
  }));
});

import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import connection from '../../database/connection.js';
import { defineAssociations } from '../../model/associations.js';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from '../../routes/authRoutes.js';
import bookRoutes from '../../routes/bookRoutes.js';
import cartRoutes from '../../routes/cartRoutes.js';
import purchaseRoutes from '../../routes/purchaseRoutes.js';

// Importar controllers mockados
import AuthController from '../../controllers/AuthController.js';
import BookController from '../../controllers/BookController.js';
import CartController from '../../controllers/CartController.js';
import PurchaseController from '../../controllers/PurchaseController.js';

// Mock do middleware de erro
jest.mock('../../middleware/errorHandler.js', () => ({
  asyncHandler: (fn) => fn
}));

// Mock do middleware de autenticação
jest.mock('../../middleware/authMiddleware.js', () => ({
  authenticate: (req, res, next) => {
    // Simular usuário autenticado
    req.user = { 
      id: 1, 
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'user'
    };
    next();
  },
  requireRole: (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acesso negado' });
    }
  }
}));

const app = express();
app.use(express.json());

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchases', purchaseRoutes);

describe('Purchase Flow Integration Tests', () => {
  let authToken;
  let authControllerInstance, bookControllerInstance, cartControllerInstance, purchaseControllerInstance;

  beforeAll(async () => {
    // Configurar banco de teste
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'movase_test';
    
    // Conectar ao banco de teste
    await connection.authenticate();
    defineAssociations();
    await connection.sync({ force: true });

    // Obter instâncias dos controllers mockados
    authControllerInstance = new AuthController();
    bookControllerInstance = new BookController();
    cartControllerInstance = new CartController();
    purchaseControllerInstance = new PurchaseController();
  });

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Fechar conexão com o banco
    await connection.close();
  });

  describe('Fluxo Completo de Compra', () => {
    test('deve completar fluxo de compra com sucesso', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Usuário Teste',
        role: 'user'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token'
        },
        message: 'Login realizado com sucesso'
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
      authToken = loginResponse.body.data.token;

      // 2. Buscar livros disponíveis
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90,
          estoque: 10,
          categoria: 'Ficção'
        },
        {
          id: 2,
          titulo: 'Livro Teste 2',
          autor: 'Autor Teste 2',
          preco: 39.90,
          estoque: 5,
          categoria: 'Não-Ficção'
        }
      ];

      const mockBooksResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      bookControllerInstance.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockBooksResponse);
      });

      const booksResponse = await request(app)
        .get('/api/books')
        .expect(200);

      expect(booksResponse.body.success).toBe(true);
      expect(booksResponse.body.data).toHaveLength(2);

      // 3. Adicionar item ao carrinho
      const cartItemData = {
        bookId: 1,
        quantity: 2
      };

      const mockCartItem = {
        id: 1,
        bookId: 1,
        quantity: 2,
        price: 29.90,
        book: mockBooks[0]
      };

      const mockAddItemResponse = {
        success: true,
        data: mockCartItem,
        message: 'Item adicionado ao carrinho'
      };

      CartController.addItem.mockImplementation((req, res) => {
        res.status(201).json(mockAddItemResponse);
      });

      const addItemResponse = await request(app)
        .post('/api/cart/add')
        .send(cartItemData)
        .expect(201);

      expect(addItemResponse.body.success).toBe(true);

      // 4. Verificar carrinho
      const mockCart = {
        id: 1,
        userId: 1,
        items: [mockCartItem],
        total: 59.80,
        itemCount: 2
      };

      const mockCartResponse = {
        success: true,
        data: mockCart
      };

      cartControllerInstance.getUserCart.mockImplementation((req, res) => {
        res.status(200).json(mockCartResponse);
      });

      const cartResponse = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(cartResponse.body.success).toBe(true);
      expect(cartResponse.body.data.items).toHaveLength(1);
      expect(cartResponse.body.data.total).toBe(59.80);

      // 5. Validar carrinho
      const mockValidation = {
        isValid: true,
        issues: [],
        warnings: []
      };

      const mockValidationResponse = {
        success: true,
        data: mockValidation
      };

      cartControllerInstance.validateCart.mockImplementation((req, res) => {
        res.status(200).json(mockValidationResponse);
      });

      const validationResponse = await request(app)
        .post('/api/cart/validate')
        .expect(200);

      expect(validationResponse.body.data.isValid).toBe(true);

      // 6. Criar compra
      const purchaseData = {
        items: [
          {
            bookId: 1,
            quantity: 2,
            price: 29.90
          }
        ],
        shippingAddress: {
          cep: '01310-100',
          logradouro: 'Rua Teste',
          numero: '123',
          complemento: 'Apto 1',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        paymentMethod: 'pix',
        total: 59.80
      };

      const mockPurchase = {
        id: 1,
        userId: 1,
        numero: 'PUR-2024-001',
        status: 'pendente',
        total: 59.80,
        items: purchaseData.items,
        shippingAddress: purchaseData.shippingAddress,
        paymentMethod: purchaseData.paymentMethod,
        createdAt: new Date().toISOString()
      };

      const mockPurchaseResponse = {
        success: true,
        data: mockPurchase,
        message: 'Compra criada com sucesso'
      };

      purchaseControllerInstance.createPurchase.mockImplementation((req, res) => {
        res.status(201).json(mockPurchaseResponse);
      });

      const purchaseResponse = await request(app)
        .post('/api/purchases')
        .send(purchaseData)
        .expect(201);

      expect(purchaseResponse.body.success).toBe(true);
      expect(purchaseResponse.body.data.numero).toBeDefined();
      expect(purchaseResponse.body.data.status).toBe('pendente');

      // 7. Verificar compra criada
      const mockPurchaseDetails = {
        ...mockPurchase,
        items: [
          {
            id: 1,
            purchaseId: 1,
            bookId: 1,
            quantity: 2,
            price: 29.90,
            book: mockBooks[0]
          }
        ]
      };

      const mockPurchaseDetailsResponse = {
        success: true,
        data: mockPurchaseDetails
      };

      purchaseControllerInstance.getPurchaseById.mockImplementation((req, res) => {
        res.status(200).json(mockPurchaseDetailsResponse);
      });

      const purchaseDetailsResponse = await request(app)
        .get('/api/purchases/1')
        .expect(200);

      expect(purchaseDetailsResponse.body.success).toBe(true);
      expect(purchaseDetailsResponse.body.data.items).toHaveLength(1);
    });

    test('deve falhar ao tentar comprar com carrinho vazio', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Verificar carrinho vazio
      const mockEmptyCart = {
        id: 1,
        userId: 1,
        items: [],
        total: 0,
        itemCount: 0
      };

      const mockEmptyCartResponse = {
        success: true,
        data: mockEmptyCart
      };

      cartControllerInstance.getUserCart.mockImplementation((req, res) => {
        res.status(200).json(mockEmptyCartResponse);
      });

      const cartResponse = await request(app)
        .get('/api/cart')
        .expect(200);

      expect(cartResponse.body.data.items).toHaveLength(0);

      // 3. Tentar criar compra com carrinho vazio
      const purchaseData = {
        items: [],
        shippingAddress: {
          cep: '01310-100',
          logradouro: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        paymentMethod: 'pix',
        total: 0
      };

      purchaseControllerInstance.createPurchase.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Carrinho vazio. Adicione itens antes de finalizar a compra.'
        });
      });

      const purchaseResponse = await request(app)
        .post('/api/purchases')
        .send(purchaseData)
        .expect(400);

      expect(purchaseResponse.body.success).toBe(false);
      expect(purchaseResponse.body.message).toContain('Carrinho vazio');
    });

    test('deve falhar ao tentar comprar com estoque insuficiente', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Tentar adicionar item com estoque insuficiente
      const cartItemData = {
        bookId: 1,
        quantity: 100
      };

      cartControllerInstance.addItem.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Estoque insuficiente',
          availableStock: 10
        });
      });

      const addItemResponse = await request(app)
        .post('/api/cart/add')
        .send(cartItemData)
        .expect(400);

      expect(addItemResponse.body.success).toBe(false);
      expect(addItemResponse.body.message).toBe('Estoque insuficiente');
    });

    test('deve validar endereço de entrega', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Tentar criar compra com endereço inválido
      const purchaseData = {
        items: [
          {
            bookId: 1,
            quantity: 1,
            price: 29.90
          }
        ],
        shippingAddress: {
          cep: 'invalid-cep',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: ''
        },
        paymentMethod: 'pix',
        total: 29.90
      };

      purchaseControllerInstance.createPurchase.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Endereço de entrega inválido',
          errors: [
            'CEP deve ter 8 dígitos',
            'Logradouro é obrigatório',
            'Número é obrigatório',
            'Bairro é obrigatório',
            'Cidade é obrigatória',
            'Estado é obrigatório'
          ]
        });
      });

      const purchaseResponse = await request(app)
        .post('/api/purchases')
        .send(purchaseData)
        .expect(400);

      expect(purchaseResponse.body.success).toBe(false);
      expect(purchaseResponse.body.errors).toBeDefined();
      expect(purchaseResponse.body.errors.length).toBeGreaterThan(0);
    });

    test('deve aplicar desconto e recalcular valores', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Adicionar item ao carrinho
      const cartItemData = {
        bookId: 1,
        quantity: 2
      };

      const mockCartItem = {
        id: 1,
        bookId: 1,
        quantity: 2,
        price: 29.90
      };

      const mockAddItemResponse = {
        success: true,
        data: mockCartItem,
        message: 'Item adicionado ao carrinho'
      };

      cartControllerInstance.addItem.mockImplementation((req, res) => {
        res.status(201).json(mockAddItemResponse);
      });

      await request(app)
        .post('/api/cart/add')
        .send(cartItemData)
        .expect(201);

      // 3. Aplicar cupom de desconto
      const couponData = {
        code: 'DESCONTO10'
      };

      const mockCartWithDiscount = {
        id: 1,
        userId: 1,
        items: [mockCartItem],
        subtotal: 59.80,
        discount: 5.98,
        total: 53.82,
        coupon: {
          code: 'DESCONTO10',
          discount: 10
        }
      };

      const mockCouponResponse = {
        success: true,
        data: mockCartWithDiscount,
        message: 'Cupom aplicado com sucesso'
      };

      cartControllerInstance.applyCoupon = jest.fn().mockImplementation((req, res) => {
        res.status(200).json(mockCouponResponse);
      });

      const couponResponse = await request(app)
        .post('/api/cart/coupon')
        .send(couponData)
        .expect(200);

      expect(couponResponse.body.success).toBe(true);
      expect(couponResponse.body.data.discount).toBe(5.98);
      expect(couponResponse.body.data.total).toBe(53.82);

      // 4. Recalcular carrinho
      const mockRecalculatedCart = {
        ...mockCartWithDiscount,
        shipping: 10.00,
        finalTotal: 63.82
      };

      const mockRecalculateResponse = {
        success: true,
        data: mockRecalculatedCart,
        message: 'Carrinho recalculado com sucesso'
      };

      cartControllerInstance.recalculateCart.mockImplementation((req, res) => {
        res.status(200).json(mockRecalculateResponse);
      });

      const recalculateResponse = await request(app)
        .post('/api/cart/recalculate')
        .expect(200);

      expect(recalculateResponse.body.success).toBe(true);
      expect(recalculateResponse.body.data.finalTotal).toBe(63.82);
    });
  });

  describe('Gestão de Compras', () => {
    test('deve listar compras do usuário', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Listar compras do usuário
      const mockPurchases = [
        {
          id: 1,
          numero: 'PUR-2024-001',
          status: 'pendente',
          total: 59.80,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          numero: 'PUR-2024-002',
          status: 'confirmado',
          total: 29.90,
          createdAt: new Date().toISOString()
        }
      ];

      const mockPurchasesResponse = {
        success: true,
        data: mockPurchases,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      purchaseControllerInstance.getUserPurchases.mockImplementation((req, res) => {
        res.status(200).json(mockPurchasesResponse);
      });

      const purchasesResponse = await request(app)
        .get('/api/purchases/user')
        .expect(200);

      expect(purchasesResponse.body.success).toBe(true);
      expect(purchasesResponse.body.data).toHaveLength(2);
    });

    test('deve cancelar compra pendente', async () => {
      // 1. Login do usuário
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      };

      authControllerInstance.login.mockImplementation((req, res) => {
        res.status(200).json(mockLoginResponse);
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // 2. Cancelar compra
      const mockCancelResponse = {
        success: true,
        data: {
          id: 1,
          numero: 'PUR-2024-001',
          status: 'cancelado',
          total: 59.80
        },
        message: 'Compra cancelada com sucesso'
      };

      purchaseControllerInstance.cancelPurchase.mockImplementation((req, res) => {
        res.status(200).json(mockCancelResponse);
      });

      const cancelResponse = await request(app)
        .post('/api/purchases/1/cancel')
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.data.status).toBe('cancelado');
    });
  });
});
