/**
 * EMAIL CONTROLLER - Controlador de Emails
 * 
 * Gerencia todas as operações relacionadas ao envio de emails
 * e fornece endpoints para administração do sistema de email
 */

import emailService from '../services/emailService.js';
import ResponseHandler from '../utils/responseHandler.js';
import ErrorHandler from '../middleware/errorHandler.js';
import ValidationUtils from '../utils/validation.js';

class EmailController {
  constructor() {
    this.emailService = emailService;
  }

  /**
   * Testar conexão SMTP
   */
  async testConnection(req, res, next) {
    try {
      const result = await this.emailService.testConnection();
      
      if (result.success) {
        return ResponseHandler.success(res, 'Conexão SMTP testada com sucesso', result);
      } else {
        return ResponseHandler.badRequest(res, 'Falha na conexão SMTP', result);
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Obter estatísticas do serviço de email
   */
  async getStats(req, res, next) {
    try {
      const stats = this.emailService.getStats();
      return ResponseHandler.success(res, 'Estatísticas do serviço de email', stats);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Enviar email de teste
   */
  async sendTestEmail(req, res, next) {
    try {
      const { email, template, context } = req.body;

      // Validações
      if (!ValidationUtils.required(email)) {
        return ResponseHandler.badRequest(res, 'Email é obrigatório');
      }

      if (!ValidationUtils.email(email)) {
        return ResponseHandler.badRequest(res, 'Email inválido');
      }

      if (!ValidationUtils.required(template)) {
        return ResponseHandler.badRequest(res, 'Template é obrigatório');
      }

      // Enviar email de teste
      await this.emailService.sendEmail({
        to: email,
        subject: 'Email de Teste - Movase',
        template: template,
        context: context || {
          name: 'Usuário de Teste',
          message: 'Este é um email de teste do sistema Movase'
        }
      });

      return ResponseHandler.success(res, 'Email de teste enviado com sucesso');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Limpar fila de emails
   */
  async clearQueue(req, res, next) {
    try {
      this.emailService.clearQueue();
      return ResponseHandler.success(res, 'Fila de emails limpa com sucesso');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Reenviar email de verificação
   */
  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      // Validações
      if (!ValidationUtils.required(email)) {
        return ResponseHandler.badRequest(res, 'Email é obrigatório');
      }

      if (!ValidationUtils.email(email)) {
        return ResponseHandler.badRequest(res, 'Email inválido');
      }

      // TODO: Buscar usuário no banco e gerar novo token
      // Por enquanto, apenas simular
      const mockUser = {
        name: 'Usuário',
        email: email
      };

      const mockToken = 'mock-verification-token-' + Date.now();

      await this.emailService.sendEmailVerification(mockUser, mockToken);

      return ResponseHandler.success(res, 'Email de verificação reenviado com sucesso');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordResetEmail(req, res, next) {
    try {
      const { email } = req.body;

      // Validações
      if (!ValidationUtils.required(email)) {
        return ResponseHandler.badRequest(res, 'Email é obrigatório');
      }

      if (!ValidationUtils.email(email)) {
        return ResponseHandler.badRequest(res, 'Email inválido');
      }

      // TODO: Buscar usuário no banco e gerar token de reset
      // Por enquanto, apenas simular
      const mockUser = {
        name: 'Usuário',
        email: email
      };

      const mockToken = 'mock-reset-token-' + Date.now();

      await this.emailService.sendPasswordReset(mockUser, mockToken);

      return ResponseHandler.success(res, 'Email de recuperação de senha enviado com sucesso');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Enviar notificação administrativa
   */
  async sendAdminNotification(req, res, next) {
    try {
      const { subject, message, data } = req.body;

      // Validações
      if (!ValidationUtils.required(subject)) {
        return ResponseHandler.badRequest(res, 'Assunto é obrigatório');
      }

      if (!ValidationUtils.required(message)) {
        return ResponseHandler.badRequest(res, 'Mensagem é obrigatória');
      }

      await this.emailService.sendAdminNotification(subject, message, data);

      return ResponseHandler.success(res, 'Notificação administrativa enviada com sucesso');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Listar templates disponíveis
   */
  async listTemplates(req, res, next) {
    try {
      const templates = [
        {
          name: 'welcome',
          description: 'Email de boas-vindas para novos usuários',
          variables: ['name', 'email', 'loginUrl']
        },
        {
          name: 'email-verification',
          description: 'Confirmação de email',
          variables: ['name', 'verificationUrl', 'expiresIn']
        },
        {
          name: 'password-reset',
          description: 'Recuperação de senha',
          variables: ['name', 'resetUrl', 'expiresIn']
        },
        {
          name: 'order-confirmation',
          description: 'Confirmação de pedido',
          variables: ['name', 'orderNumber', 'orderDate', 'total', 'items', 'trackingUrl']
        },
        {
          name: 'order-status-update',
          description: 'Atualização de status do pedido',
          variables: ['name', 'orderNumber', 'status', 'message', 'trackingUrl']
        },
        {
          name: 'admin-notification',
          description: 'Notificação administrativa',
          variables: ['subject', 'message', 'data', 'timestamp']
        }
      ];

      return ResponseHandler.success(res, 'Templates disponíveis', templates);
    } catch (error) {
      return next(error);
    }
  }
}

export default EmailController;
