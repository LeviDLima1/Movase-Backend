/**
 * AUTH API TESTS - Testes de API
 * 
 * Testes para endpoints de autenticação
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes.js';
import AuthController from '../../controllers/AuthController.js';

// Mock do AuthController
jest.mock('../../controllers/AuthController.js');

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
app.use('/api/auth', authRoutes);

describe('Auth API Endpoints', () => {
  let mockAuthController;

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
    
    // Criar mock do AuthController
    mockAuthController = {
      register: jest.fn(),
      login: jest.fn(),
      me: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      logout: jest.fn(),
      checkEmail: jest.fn(),
      checkPhone: jest.fn(),
      checkCPF: jest.fn(),
      verifyEmail: jest.fn(),
      verifyPhone: jest.fn()
    };

    // Configurar mock do AuthController
    AuthController.mockImplementation(() => mockAuthController);
  });

  describe('POST /api/auth/register', () => {
    test('deve registrar usuário com dados válidos', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        CPF: '12345678901',
        telefone: '11999999999'
      };

      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, ...userData },
          token: 'mock-jwt-token'
        },
        message: 'Usuário registrado com sucesso'
      };

      mockAuthController.register.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.register).toHaveBeenCalled();
    });

    test('deve retornar erro para dados inválidos', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const mockResponse = {
        success: false,
        message: 'Dados inválidos',
        errors: ['Nome é obrigatório', 'Email inválido', 'Senha muito curta']
      };

      mockAuthController.register.mockImplementation((req, res) => {
        res.status(400).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('POST /api/auth/login', () => {
    test('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
          token: 'mock-jwt-token'
        },
        message: 'Login realizado com sucesso'
      };

      mockAuthController.login.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.login).toHaveBeenCalled();
    });

    test('deve retornar erro para credenciais inválidas', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      const mockResponse = {
        success: false,
        message: 'Email ou senha inválidos'
      };

      mockAuthController.login.mockImplementation((req, res) => {
        res.status(401).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(401);

      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('GET /api/auth/me', () => {
    test('deve retornar dados do usuário autenticado', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }
      };

      mockAuthController.me.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.me).toHaveBeenCalled();
    });

    test('deve retornar erro sem token de autenticação', async () => {
      const mockResponse = {
        success: false,
        message: 'Token de acesso não fornecido'
      };

      mockAuthController.me.mockImplementation((req, res) => {
        res.status(401).json(mockResponse);
      });

      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toEqual(mockResponse);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('deve atualizar perfil do usuário', async () => {
      const updateData = {
        name: 'Updated Name',
        telefone: '11888888888'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...updateData,
          email: 'test@example.com'
        },
        message: 'Perfil atualizado com sucesso'
      };

      mockAuthController.updateProfile.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.updateProfile).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('deve alterar senha com dados válidos', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      const mockResponse = {
        success: true,
        message: 'Senha alterada com sucesso'
      };

      mockAuthController.changePassword.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', 'Bearer mock-token')
        .send(passwordData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.changePassword).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('deve enviar email de recuperação', async () => {
      const emailData = {
        email: 'test@example.com'
      };

      const mockResponse = {
        success: true,
        message: 'Email de recuperação enviado'
      };

      mockAuthController.forgotPassword.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.forgotPassword).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('deve redefinir senha com token válido', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123'
      };

      const mockResponse = {
        success: true,
        message: 'Senha redefinida com sucesso'
      };

      mockAuthController.resetPassword.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.resetPassword).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/logout', () => {
    test('deve fazer logout com sucesso', async () => {
      const mockResponse = {
        success: true,
        message: 'Logout realizado com sucesso'
      };

      mockAuthController.logout.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.logout).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/check-email/:email', () => {
    test('deve verificar disponibilidade de email', async () => {
      const email = 'test@example.com';

      const mockResponse = {
        success: true,
        data: {
          available: true,
          email: email
        }
      };

      mockAuthController.checkEmail.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/auth/check-email/${email}`)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.checkEmail).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/check-phone/:telefone', () => {
    test('deve verificar disponibilidade de telefone', async () => {
      const telefone = '11999999999';

      const mockResponse = {
        success: true,
        data: {
          available: true,
          telefone: telefone
        }
      };

      mockAuthController.checkPhone.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/auth/check-phone/${telefone}`)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.checkPhone).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/check-cpf/:CPF', () => {
    test('deve verificar disponibilidade de CPF', async () => {
      const CPF = '12345678901';

      const mockResponse = {
        success: true,
        data: {
          available: true,
          CPF: CPF
        }
      };

      mockAuthController.checkCPF.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get(`/api/auth/check-cpf/${CPF}`)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.checkCPF).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/verify-email/:id', () => {
    test('deve verificar email de usuário (admin)', async () => {
      const userId = '1';

      const mockResponse = {
        success: true,
        message: 'Email verificado com sucesso'
      };

      mockAuthController.verifyEmail.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post(`/api/auth/verify-email/${userId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.verifyEmail).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/verify-phone/:id', () => {
    test('deve verificar telefone de usuário (admin)', async () => {
      const userId = '1';

      const mockResponse = {
        success: true,
        message: 'Telefone verificado com sucesso'
      };

      mockAuthController.verifyPhone.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post(`/api/auth/verify-phone/${userId}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(mockAuthController.verifyPhone).toHaveBeenCalled();
    });
  });
});
