/**
 * PERFORMANCE TESTS - Testes de Performance
 * 
 * Testes para verificar performance e velocidade dos endpoints
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

// Importar controllers mockados
import AuthController from '../../controllers/AuthController.js';
import BookController from '../../controllers/BookController.js';
import CartController from '../../controllers/CartController.js';

// Mock do middleware de erro
jest.mock('../../middleware/errorHandler.js', () => ({
  asyncHandler: (fn) => fn
}));

// Mock do middleware de autenticação
jest.mock('../../middleware/authMiddleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { 
      id: 1, 
      email: 'test@example.com',
      name: 'Usuário Teste',
      role: 'user'
    };
    next();
  },
  requireRole: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);

describe('Performance Tests', () => {
  let authControllerInstance, bookControllerInstance, cartControllerInstance;

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
  });

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Fechar conexão com o banco
    await connection.close();
  });

  describe('Performance de Endpoints Críticos', () => {
    test('deve responder listagem de livros em menos de 500ms', async () => {
      const mockBooks = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        titulo: `Livro Teste ${i + 1}`,
        autor: `Autor Teste ${i + 1}`,
        preco: 29.90 + (i * 0.10),
        categoria: i % 2 === 0 ? 'Ficção' : 'Não-Ficção',
        estoque: 10
      }));

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 100,
          total: 100,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      bookControllerInstance.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/books?limit=100')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(100);
      expect(responseTime).toBeLessThan(500); // Deve responder em menos de 500ms
      
      console.log(`📊 Listagem de livros: ${responseTime}ms`);
    });

    test('deve responder busca de livro por ID em menos de 200ms', async () => {
      const mockBook = {
        id: 1,
        titulo: 'Livro Teste 1',
        autor: 'Autor Teste 1',
        preco: 29.90,
        categoria: 'Ficção',
        estoque: 10,
        sinopse: 'Sinopse do livro teste',
        descricao: 'Descrição detalhada do livro'
      };

      const mockResponse = {
        success: true,
        data: mockBook
      };

      bookControllerInstance.getBookById.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(responseTime).toBeLessThan(200); // Deve responder em menos de 200ms
      
      console.log(`📊 Busca por ID: ${responseTime}ms`);
    });

    test('deve responder carrinho do usuário em menos de 300ms', async () => {
      const mockCart = {
        id: 1,
        userId: 1,
        items: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          bookId: i + 1,
          quantity: 1,
          price: 29.90 + (i * 0.10),
          book: {
            id: i + 1,
            titulo: `Livro ${i + 1}`,
            autor: `Autor ${i + 1}`,
            preco: 29.90 + (i * 0.10)
          }
        })),
        total: 304.90,
        itemCount: 10
      };

      const mockResponse = {
        success: true,
        data: mockCart
      };

      cartControllerInstance.getUserCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/cart')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(10);
      expect(responseTime).toBeLessThan(300); // Deve responder em menos de 300ms
      
      console.log(`📊 Carrinho do usuário: ${responseTime}ms`);
    });

    test('deve adicionar item ao carrinho em menos de 400ms', async () => {
      const cartItemData = {
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

      cartControllerInstance.addItem.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/cart/add')
        .send(cartItemData)
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(400); // Deve responder em menos de 400ms
      
      console.log(`📊 Adicionar ao carrinho: ${responseTime}ms`);
    });
  });

  describe('Testes de Carga', () => {
    test('deve lidar com múltiplas requisições simultâneas', async () => {
      const mockBooks = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        titulo: `Livro Teste ${i + 1}`,
        autor: `Autor Teste ${i + 1}`,
        preco: 29.90 + (i * 0.10),
        categoria: i % 2 === 0 ? 'Ficção' : 'Não-Ficção',
        estoque: 10
      }));

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 50,
          total: 50,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      bookControllerInstance.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const numberOfRequests = 10;
      const promises = [];

      const startTime = Date.now();

      // Fazer múltiplas requisições simultâneas
      for (let i = 0; i < numberOfRequests; i++) {
        promises.push(
          request(app)
            .get('/api/books?limit=50')
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / numberOfRequests;

      // Verificar se todas as respostas foram bem-sucedidas
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(50);
      });

      expect(averageTime).toBeLessThan(100); // Tempo médio deve ser menor que 100ms
      
      console.log(`📊 ${numberOfRequests} requisições simultâneas:`);
      console.log(`   - Tempo total: ${totalTime}ms`);
      console.log(`   - Tempo médio: ${averageTime.toFixed(2)}ms`);
    });

    test('deve lidar com requisições de busca com filtros complexos', async () => {
      const mockBooks = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        titulo: `Livro Teste ${i + 1}`,
        autor: `Autor Teste ${i + 1}`,
        preco: 29.90 + (i * 0.10),
        categoria: i % 3 === 0 ? 'Ficção' : i % 3 === 1 ? 'Não-Ficção' : 'Técnico',
        estoque: 10,
        destaque: i % 5 === 0,
        novidade: i % 7 === 0,
        promocao: i % 11 === 0
      }));

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 25,
          total: 25,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      bookControllerInstance.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const complexQueries = [
        '/api/books?categoria=Ficção&destaque=true&limit=25',
        '/api/books?categoria=Não-Ficção&novidade=true&limit=25',
        '/api/books?categoria=Técnico&promocao=true&limit=25',
        '/api/books?precoMin=30&precoMax=50&limit=25',
        '/api/books?search=teste&sortBy=preco&sortOrder=ASC&limit=25'
      ];

      const startTime = Date.now();
      const promises = complexQueries.map(query => 
        request(app).get(query).expect(200)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / complexQueries.length;

      // Verificar se todas as respostas foram bem-sucedidas
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(25);
      });

      expect(averageTime).toBeLessThan(200); // Tempo médio deve ser menor que 200ms
      
      console.log(`📊 Consultas complexas:`);
      console.log(`   - Tempo total: ${totalTime}ms`);
      console.log(`   - Tempo médio: ${averageTime.toFixed(2)}ms`);
    });
  });

  describe('Testes de Memória e Recursos', () => {
    test('deve manter performance consistente em múltiplas requisições', async () => {
      const mockBook = {
        id: 1,
        titulo: 'Livro Teste 1',
        autor: 'Autor Teste 1',
        preco: 29.90,
        categoria: 'Ficção',
        estoque: 10
      };

      const mockResponse = {
        success: true,
        data: mockBook
      };

      bookControllerInstance.getBookById.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const responseTimes = [];
      const numberOfRequests = 20;

      for (let i = 0; i < numberOfRequests; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/books/1')
          .expect(200);

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);

        expect(response.body.success).toBe(true);
        
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const variance = responseTimes.reduce((acc, time) => acc + Math.pow(time - averageTime, 2), 0) / responseTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // Verificar consistência de performance
      expect(averageTime).toBeLessThan(100); // Tempo médio deve ser menor que 100ms
      expect(maxTime - minTime).toBeLessThan(50); // Variação máxima deve ser menor que 50ms
      expect(standardDeviation).toBeLessThan(20); // Desvio padrão deve ser menor que 20ms
      
      console.log(`📊 Consistência de performance:`);
      console.log(`   - Tempo médio: ${averageTime.toFixed(2)}ms`);
      console.log(`   - Tempo mínimo: ${minTime}ms`);
      console.log(`   - Tempo máximo: ${maxTime}ms`);
      console.log(`   - Desvio padrão: ${standardDeviation.toFixed(2)}ms`);
    });

    test('deve lidar com payloads grandes sem degradação significativa', async () => {
      // Criar payload grande com muitos livros
      const largeBookList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        titulo: `Livro Teste ${i + 1}`,
        autor: `Autor Teste ${i + 1}`,
        preco: 29.90 + (i * 0.10),
        categoria: i % 5 === 0 ? 'Ficção' : i % 5 === 1 ? 'Não-Ficção' : i % 5 === 2 ? 'Técnico' : i % 5 === 3 ? 'Religioso' : 'Infantil',
        estoque: 10,
        sinopse: `Sinopse detalhada do livro ${i + 1} com informações adicionais para testar o tamanho do payload.`,
        descricao: `Descrição completa do livro ${i + 1} incluindo detalhes sobre o conteúdo, público-alvo e características especiais.`,
        tags: [`tag${i + 1}`, `categoria${i % 5}`, `popular`],
        avaliacoes: Math.floor(Math.random() * 5) + 1,
        totalAvaliacoes: Math.floor(Math.random() * 100) + 1,
        vendas: Math.floor(Math.random() * 1000) + 1
      }));

      const mockResponse = {
        success: true,
        data: largeBookList,
        pagination: {
          page: 1,
          limit: 1000,
          total: 1000,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      bookControllerInstance.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/books?limit=1000')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1000);
      expect(responseTime).toBeLessThan(1000); // Deve responder em menos de 1 segundo mesmo com payload grande
      
      console.log(`📊 Payload grande (1000 livros): ${responseTime}ms`);
    });
  });

  describe('Testes de Concorrência', () => {
    test('deve lidar com operações concorrentes no carrinho', async () => {
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

      cartControllerInstance.getUserCart.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      cartControllerInstance.addItem.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: {
            id: 1,
            bookId: req.body.bookId,
            quantity: req.body.quantity,
            price: 29.90
          },
          message: 'Item adicionado ao carrinho'
        });
      });

      const concurrentOperations = [
        () => request(app).get('/api/cart').expect(200),
        () => request(app).post('/api/cart/add').send({ bookId: 1, quantity: 1 }).expect(201),
        () => request(app).get('/api/cart').expect(200),
        () => request(app).post('/api/cart/add').send({ bookId: 2, quantity: 2 }).expect(201),
        () => request(app).get('/api/cart').expect(200)
      ];

      const startTime = Date.now();
      const promises = concurrentOperations.map(operation => operation());
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verificar se todas as operações foram bem-sucedidas
      responses.forEach(response => {
        expect(response.status).toBeLessThan(400); // Todas devem ter status de sucesso
      });

      expect(totalTime).toBeLessThan(1000); // Deve completar em menos de 1 segundo
      
      console.log(`📊 Operações concorrentes no carrinho: ${totalTime}ms`);
    });
  });
});
