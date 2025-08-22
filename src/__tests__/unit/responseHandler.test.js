/**
 * RESPONSE HANDLER TEST - Testes para o sistema de respostas padronizadas
 * 
 * Testa todos os métodos do ResponseHandler para garantir que as respostas
 * estão sendo formatadas corretamente.
 */

import ResponseHandler from '../../utils/responseHandler.js';

describe('ResponseHandler', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('success()', () => {
    test('deve retornar resposta de sucesso padrão', () => {
      const data = { id: 1, name: 'Teste' };
      const message = 'Operação realizada com sucesso';

      ResponseHandler.success(mockRes, data, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: 200,
        message,
        data,
        timestamp: expect.any(String)
      });
    });

    test('deve retornar resposta de sucesso sem dados', () => {
      const message = 'Operação realizada com sucesso';

      ResponseHandler.success(mockRes, null, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: 200,
        message,
        data: null,
        timestamp: expect.any(String)
      });
    });
  });

  describe('created()', () => {
    test('deve retornar resposta de criação', () => {
      const data = { id: 1, name: 'Novo Item' };
      const message = 'Item criado com sucesso';

      ResponseHandler.created(mockRes, data, message);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: 201,
        message,
        data,
        timestamp: expect.any(String)
      });
    });
  });

  describe('noContent()', () => {
    test('deve retornar resposta sem conteúdo', () => {
      ResponseHandler.noContent(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalledWith();
    });
  });

  describe('badRequest()', () => {
    test('deve retornar resposta de requisição inválida', () => {
      const message = 'Dados inválidos';
      const errors = 'Validation error';

      ResponseHandler.badRequest(mockRes, message, errors);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 400,
        message,
        errors,
        timestamp: expect.any(String)
      });
    });
  });

  describe('unauthorized()', () => {
    test('deve retornar resposta de não autorizado', () => {
      const message = 'Acesso não autorizado';

      ResponseHandler.unauthorized(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 401,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('forbidden()', () => {
    test('deve retornar resposta de acesso negado', () => {
      const message = 'Acesso proibido';

      ResponseHandler.forbidden(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 403,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('notFound()', () => {
    test('deve retornar resposta de não encontrado', () => {
      const message = 'Recurso não encontrado';

      ResponseHandler.notFound(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 404,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('conflict()', () => {
    test('deve retornar resposta de conflito', () => {
      const message = 'Conflito de dados';

      ResponseHandler.conflict(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 409,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('unprocessableEntity()', () => {
    test('deve retornar resposta de entidade não processável', () => {
      const message = 'Dados não podem ser processados';
      const errors = 'Validation errors';

      ResponseHandler.unprocessableEntity(mockRes, message, errors);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 422,
        message,
        errors,
        timestamp: expect.any(String)
      });
    });
  });

  describe('internalServerError()', () => {
    test('deve retornar resposta de erro interno', () => {
      const message = 'Erro interno do servidor';
      const error = 'Database connection failed';

      ResponseHandler.internalServerError(mockRes, message, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 500,
        message,
        error: null, // Em produção, error é null
        timestamp: expect.any(String)
      });
    });
  });

  describe('timeout()', () => {
    test('deve retornar resposta de timeout', () => {
      const message = 'Tempo limite da requisição excedido';

      ResponseHandler.timeout(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(408);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 408,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('tooManyRequests()', () => {
    test('deve retornar resposta de muitas requisições', () => {
      const message = 'Muitas requisições';

      ResponseHandler.tooManyRequests(mockRes, message);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        status: 429,
        message,
        timestamp: expect.any(String)
      });
    });
  });

  describe('paginated()', () => {
    test('deve retornar resposta paginada', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const page = 1;
      const limit = 10;
      const total = 50;

      ResponseHandler.paginated(mockRes, data, page, limit, total);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        status: 200,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPrevPage: false
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('Formatação de timestamp', () => {
    test('deve incluir timestamp ISO válido', () => {
      ResponseHandler.success(mockRes);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Encadeamento de métodos', () => {
    test('deve permitir encadeamento de status e json', () => {
      ResponseHandler.success(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
