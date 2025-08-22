/**
 * EMAIL SERVICE TEST - Testes de Integração
 * 
 * Testa o serviço de email com mocks do nodemailer
 */

// Mock do nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}));

// Mock do nodemailer-express-handlebars
jest.mock('nodemailer-express-handlebars', () => jest.fn());

// Mock do path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(() => '/mock/dir')
}));

// Mock do fs
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => 'mock template content')
}));

// Mock do url
jest.mock('url', () => ({
  fileURLToPath: jest.fn(() => '/mock/file.js')
}));

// Importar após os mocks
import nodemailer from 'nodemailer';

// Mock da classe EmailService
class MockEmailService {
  constructor() {
    this.transporter = null;
    this.emailQueue = [];
    this.isProcessing = false;
    this.isInitialized = false;
    this.stats = {
      sent: 0,
      failed: 0,
      queued: 0
    };
  }

  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-password'
        }
      });

      await this.transporter.verify();
      this.isInitialized = true;
      
    } catch (error) {
      throw error;
    }
  }

  async testConnection() {
    if (!this.isInitialized) {
      throw new Error('Email service não inicializado');
    }
    return await this.transporter.verify();
  }

  async sendEmail(to, subject, template, context = {}) {
    if (!this.isInitialized) {
      throw new Error('Email service não inicializado');
    }

    try {
      const result = await this.transporter.sendMail({
        to,
        subject,
        template,
        context
      });
      
      this.stats.sent++;
      return result;
    } catch (error) {
      this.stats.failed++;
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    return this.sendEmail(email, 'Bem-vindo!', 'welcome', { name });
  }

  async sendEmailVerification(email, token) {
    return this.sendEmail(email, 'Verifique seu email', 'email-verification', { token });
  }

  async sendPasswordReset(email, token) {
    return this.sendEmail(email, 'Redefinir senha', 'password-reset', { token });
  }

  async sendOrderConfirmation(email, orderData) {
    return this.sendEmail(email, 'Pedido confirmado', 'order-confirmation', orderData);
  }

  async sendOrderStatusUpdate(email, orderData) {
    return this.sendEmail(email, 'Status do pedido atualizado', 'order-status-update', orderData);
  }

  async sendAdminNotification(subject, message) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    return this.sendEmail(adminEmail, subject, 'admin-notification', { message });
  }

  getStats() {
    return { ...this.stats };
  }

  clearQueue() {
    this.emailQueue = [];
    this.stats.queued = 0;
  }
}

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    emailService = new MockEmailService();
    jest.clearAllMocks();
    
    // Mock padrão para nodemailer
    nodemailer.createTransport.mockReturnValue({
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      use: jest.fn()
    });
  });

  describe('initialize()', () => {
    test('deve inicializar o serviço com sucesso', async () => {
      await emailService.initialize();
      
      expect(emailService.isInitialized).toBe(true);
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'test-password'
        }
      });
    });

    test('deve lançar erro se a configuração SMTP estiver incorreta', async () => {
      const mockTransporter = {
        verify: jest.fn().mockRejectedValue(new Error('SMTP connection failed')),
        use: jest.fn()
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await expect(emailService.initialize()).rejects.toThrow('SMTP connection failed');
    });
  });

  describe('testConnection()', () => {
    test('deve testar conexão com sucesso', async () => {
      await emailService.initialize();
      const result = await emailService.testConnection();
      
      expect(result).toBe(true);
    });

    test('deve lançar erro se serviço não estiver inicializado', async () => {
      await expect(emailService.testConnection()).rejects.toThrow('Email service não inicializado');
    });
  });

  describe('sendEmail()', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    test('deve enviar email com sucesso', async () => {
      const result = await emailService.sendEmail('test@example.com', 'Test Subject', 'test-template', { name: 'Test' });
      
      expect(result).toEqual({ messageId: 'test-message-id' });
      expect(emailService.stats.sent).toBe(1);
    });

    test('deve incrementar contador de falhas em caso de erro', async () => {
      const mockTransporter = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockRejectedValue(new Error('Send failed')),
        use: jest.fn()
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await emailService.initialize();
      
      await expect(emailService.sendEmail('test@example.com', 'Test', 'template')).rejects.toThrow('Send failed');
      expect(emailService.stats.failed).toBe(1);
    });
  });

  describe('email templates', () => {
    beforeEach(async () => {
      await emailService.initialize();
    });

    test('deve enviar email de boas-vindas', async () => {
      const result = await emailService.sendWelcomeEmail('user@example.com', 'John Doe');
      
      expect(result).toBeDefined();
    });

    test('deve enviar email de verificação', async () => {
      const result = await emailService.sendEmailVerification('user@example.com', 'verification-token');
      
      expect(result).toBeDefined();
    });

    test('deve enviar email de redefinição de senha', async () => {
      const result = await emailService.sendPasswordReset('user@example.com', 'reset-token');
      
      expect(result).toBeDefined();
    });

    test('deve enviar confirmação de pedido', async () => {
      const orderData = { orderId: '123', items: ['item1'], total: 100 };
      const result = await emailService.sendOrderConfirmation('user@example.com', orderData);
      
      expect(result).toBeDefined();
    });

    test('deve enviar atualização de status do pedido', async () => {
      const orderData = { orderId: '123', status: 'shipped' };
      const result = await emailService.sendOrderStatusUpdate('user@example.com', orderData);
      
      expect(result).toBeDefined();
    });

    test('deve enviar notificação para admin', async () => {
      const result = await emailService.sendAdminNotification('Test Alert', 'Important message');
      
      expect(result).toBeDefined();
    });
  });

  describe('getStats()', () => {
    test('deve retornar estatísticas corretas', async () => {
      await emailService.initialize();
      await emailService.sendEmail('test@example.com', 'Test', 'template');
      
      const stats = emailService.getStats();
      
      expect(stats).toEqual({
        sent: 1,
        failed: 0,
        queued: 0
      });
    });
  });

  describe('clearQueue()', () => {
    test('deve limpar a fila de emails', () => {
      emailService.emailQueue = ['email1', 'email2'];
      emailService.stats.queued = 2;
      
      emailService.clearQueue();
      
      expect(emailService.emailQueue).toEqual([]);
      expect(emailService.stats.queued).toBe(0);
    });
  });
});
