/**
 * BOOKS API TESTS - Testes de API
 * 
 * Testes para endpoints de livros
 */

import request from 'supertest';
import express from 'express';
import bookRoutes from '../../routes/bookRoutes.js';
import BookController from '../../controllers/BookController.js';

// Mock do BookController
jest.mock('../../controllers/BookController.js');

// Mock do middleware de erro
jest.mock('../../middleware/errorHandler.js', () => ({
  asyncHandler: (fn) => fn
}));

// Mock do middleware de autenticação
jest.mock('../../middleware/authMiddleware.js', () => ({
  authenticate: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);

describe('Books API Endpoints', () => {
  let mockBookController;

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
    
    // Criar mock do BookController
    mockBookController = {
      listBooks: jest.fn(),
      getBookById: jest.fn(),
      createBook: jest.fn(),
      updateBook: jest.fn(),
      delete: jest.fn(),
      getBooksByCategory: jest.fn(),
      getBooksByAuthor: jest.fn(),
      getFeaturedBooks: jest.fn(),
      getNewBooks: jest.fn(),
      getPromotionalBooks: jest.fn(),
      getSimilarBooks: jest.fn(),
      getBooksByTags: jest.fn(),
      updateRating: jest.fn(),
      updateStock: jest.fn(),
      getBookStats: jest.fn(),
      findWithAssociations: jest.fn(),
      findByCriteria: jest.fn(),
      count: jest.fn(),
      getBookImages: jest.fn()
    };

    // Configurar mock do BookController
    BookController.mockImplementation(() => mockBookController);
  });

  describe('GET /api/books', () => {
    test('deve listar livros com paginação padrão', async () => {
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90,
          categoria: 'Ficção',
          estoque: 10
        },
        {
          id: 2,
          titulo: 'Livro Teste 2',
          autor: 'Autor Teste 2',
          preco: 39.90,
          categoria: 'Não-Ficção',
          estoque: 5
        }
      ];

      const mockResponse = {
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

      mockBookController.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.listBooks).toHaveBeenCalled();
    });

    test('deve listar livros com filtros', async () => {
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro Teste 1',
          autor: 'Autor Teste 1',
          preco: 29.90,
          categoria: 'Ficção',
          estoque: 10
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 5,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockBookController.listBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books?categoria=Ficção&limit=5&page=1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.listBooks).toHaveBeenCalled();
    });

    test('deve retornar erro quando controller falha', async () => {
      mockBookController.listBooks.mockImplementation((req, res, next) => {
        next(new Error('Erro interno do servidor'));
      });

      const response = await request(app)
        .get('/api/books')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/books/:id', () => {
    test('deve retornar livro por ID válido', async () => {
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

      mockBookController.getBookById.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getBookById).toHaveBeenCalled();
    });

    test('deve retornar 404 para ID inválido', async () => {
      mockBookController.getBookById.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Livro não encontrado'
        });
      });

      const response = await request(app)
        .get('/api/books/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Livro não encontrado');
    });
  });

  describe('POST /api/books', () => {
    test('deve criar livro com dados válidos', async () => {
      const bookData = {
        titulo: 'Novo Livro',
        autor: 'Novo Autor',
        descricao: 'Descrição do novo livro',
        sinopse: 'Sinopse do novo livro',
        isbn: '1234567890123',
        paginas: 300,
        ano: 2024,
        editora: 'Editora Teste',
        categoria: 'Ficção',
        preco: 49.90,
        estoque: 20
      };

      const mockResponse = {
        success: true,
        data: { id: 3, ...bookData },
        message: 'Livro criado com sucesso'
      };

      mockBookController.createBook.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.createBook).toHaveBeenCalled();
    });

    test('deve retornar erro para dados inválidos', async () => {
      const invalidData = {
        titulo: '',
        autor: '',
        preco: -10
      };

      mockBookController.createBook.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: ['Título é obrigatório', 'Autor é obrigatório', 'Preço deve ser positivo']
        });
      });

      const response = await request(app)
        .post('/api/books')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/books/:id', () => {
    test('deve atualizar livro com dados válidos', async () => {
      const updateData = {
        titulo: 'Livro Atualizado',
        preco: 59.90,
        estoque: 15
      };

      const mockResponse = {
        success: true,
        data: { id: 1, ...updateData },
        message: 'Livro atualizado com sucesso'
      };

      mockBookController.updateBook.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/books/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.updateBook).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/books/:id', () => {
    test('deve deletar livro com ID válido', async () => {
      const mockResponse = {
        success: true,
        message: 'Livro deletado com sucesso'
      };

      mockBookController.delete.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .delete('/api/books/1')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.delete).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/featured', () => {
    test('deve retornar livros em destaque', async () => {
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro Destaque 1',
          autor: 'Autor Destaque 1',
          preco: 29.90,
          destaque: true
        },
        {
          id: 2,
          titulo: 'Livro Destaque 2',
          autor: 'Autor Destaque 2',
          preco: 39.90,
          destaque: true
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks
      };

      mockBookController.getFeaturedBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/featured')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getFeaturedBooks).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/new', () => {
    test('deve retornar livros novos', async () => {
      const mockBooks = [
        {
          id: 3,
          titulo: 'Livro Novo 1',
          autor: 'Autor Novo 1',
          preco: 29.90,
          novidade: true
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks
      };

      mockBookController.getNewBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/new')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getNewBooks).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/promotional', () => {
    test('deve retornar livros em promoção', async () => {
      const mockBooks = [
        {
          id: 4,
          titulo: 'Livro Promoção 1',
          autor: 'Autor Promoção 1',
          preco: 19.90,
          precoOriginal: 39.90,
          promocao: true
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks
      };

      mockBookController.getPromotionalBooks.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/promotional')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getPromotionalBooks).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/category/:categoria', () => {
    test('deve retornar livros por categoria', async () => {
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro Ficção 1',
          autor: 'Autor Ficção 1',
          categoria: 'Ficção',
          preco: 29.90
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockBookController.getBooksByCategory.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/category/Ficção')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getBooksByCategory).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/author/:autor', () => {
    test('deve retornar livros por autor', async () => {
      const mockBooks = [
        {
          id: 1,
          titulo: 'Livro do Autor 1',
          autor: 'Autor Específico',
          preco: 29.90
        }
      ];

      const mockResponse = {
        success: true,
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockBookController.getBooksByAuthor.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/author/Autor%20Específico')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getBooksByAuthor).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/books/:id/stock', () => {
    test('deve atualizar estoque do livro', async () => {
      const stockData = {
        estoque: 25
      };

      const mockResponse = {
        success: true,
        data: { id: 1, estoque: 25 },
        message: 'Estoque atualizado com sucesso'
      };

      mockBookController.updateStock.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .patch('/api/books/1/stock')
        .send(stockData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.updateStock).toHaveBeenCalled();
    });
  });

  describe('GET /api/books/stats', () => {
    test('deve retornar estatísticas dos livros', async () => {
      const mockStats = {
        totalLivros: 100,
        livrosEmEstoque: 85,
        livrosSemEstoque: 15,
        categoriaMaisVendida: 'Ficção',
        autorMaisVendido: 'Autor Popular',
        faturamentoTotal: 15000.00
      };

      const mockResponse = {
        success: true,
        data: mockStats
      };

      mockBookController.getBookStats.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/books/stats')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockBookController.getBookStats).toHaveBeenCalled();
    });
  });
});
