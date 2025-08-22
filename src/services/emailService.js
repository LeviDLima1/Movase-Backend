/**
 * EMAIL SERVICE - Serviço de Envio de Emails
 * 
 * Sistema profissional de envio de emails com:
 * - Configuração SMTP flexível
 * - Templates HTML responsivos
 * - Fila de processamento assíncrono
 * - Logs e monitoramento
 * - Retry automático em caso de falha
 */

import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
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

  /**
   * Inicializar o serviço de email
   */
  async initialize() {
    try {
      // Configuração do transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Configurar templates Handlebars
      const handlebarOptions = {
        viewEngine: {
          extname: '.hbs',
          layoutsDir: path.join(__dirname, '../templates/email/layouts'),
          defaultLayout: 'main',
          partialsDir: path.join(__dirname, '../templates/email/partials')
        },
        viewPath: path.join(__dirname, '../templates/email'),
        extName: '.hbs'
      };

      this.transporter.use('compile', hbs(handlebarOptions));

      // Verificar conexão
      await this.transporter.verify();
      
      this.isInitialized = true;
      console.log('✅ Email Service inicializado com sucesso');
      
      // Iniciar processamento da fila
      this.startQueueProcessing();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Email Service:', error.message);
      throw error;
    }
  }

  /**
   * Iniciar processamento da fila de emails
   */
  startQueueProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const processQueue = async () => {
      while (this.emailQueue.length > 0) {
        const job = this.emailQueue.shift();
        
        try {
          await this.transporter.sendMail({
            to: job.to,
            subject: job.subject,
            template: job.template,
            context: job.context
          });
          
          this.stats.sent++;
          console.log(`📧 Email enviado com sucesso: ${job.email} - ${job.type}`);
          
        } catch (error) {
          this.stats.failed++;
          console.error(`❌ Falha ao enviar email: ${job.email} - ${job.type}`, error.message);
          
          // Retry automático (máximo 3 tentativas)
          if (job.retryCount < 3) {
            job.retryCount = (job.retryCount || 0) + 1;
            setTimeout(() => {
              this.emailQueue.push(job);
            }, 5000 * job.retryCount); // Delay progressivo
          }
        }
        
        // Delay entre emails para não sobrecarregar o servidor SMTP
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.isProcessing = false;
    };
    
    processQueue();
  }

  /**
   * Enviar email (adiciona à fila)
   */
  async sendEmail(options) {
    if (!this.isInitialized) {
      throw new Error('Email Service não foi inicializado');
    }

    const emailJob = {
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context || {},
      email: options.to,
      type: options.template,
      retryCount: 0
    };

    this.stats.queued++;
    this.emailQueue.push(emailJob);
    
    // Iniciar processamento da fila se não estiver rodando
    this.startQueueProcessing();
    
    return Promise.resolve({ success: true, message: 'Email adicionado à fila' });
  }

  /**
   * Enviar email de boas-vindas
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Bem-vindo à Movase! 🎉',
      template: 'welcome',
      context: {
        name: user.name,
        email: user.email,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  }

  /**
   * Enviar email de confirmação de conta
   */
  async sendEmailVerification(user, token) {
    return this.sendEmail({
      to: user.email,
      subject: 'Confirme seu email - Movase',
      template: 'email-verification',
      context: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        expiresIn: '24 horas'
      }
    });
  }

  /**
   * Enviar email de recuperação de senha
   */
  async sendPasswordReset(user, token) {
    return this.sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - Movase',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        expiresIn: '1 hora'
      }
    });
  }

  /**
   * Enviar email de confirmação de pedido
   */
  async sendOrderConfirmation(user, order) {
    return this.sendEmail({
      to: user.email,
      subject: `Pedido Confirmado - #${order.numero}`,
      template: 'order-confirmation',
      context: {
        name: user.name,
        orderNumber: order.numero,
        orderDate: new Date(order.createdAt).toLocaleDateString('pt-BR'),
        total: order.total.toFixed(2),
        items: order.items || [],
        trackingUrl: order.codigoRastreamento ? 
          `https://rastreamento.correios.com.br/app/index.php?objeto=${order.codigoRastreamento}` : null
      }
    });
  }

  /**
   * Enviar email de atualização de status do pedido
   */
  async sendOrderStatusUpdate(user, order, newStatus) {
    const statusMessages = {
      'pago': 'Seu pagamento foi confirmado!',
      'preparando': 'Seu pedido está sendo preparado!',
      'enviado': 'Seu pedido foi enviado!',
      'entregue': 'Seu pedido foi entregue!',
      'cancelado': 'Seu pedido foi cancelado',
      'devolvido': 'Seu pedido foi devolvido'
    };

    return this.sendEmail({
      to: user.email,
      subject: `Atualização do Pedido #${order.numero}`,
      template: 'order-status-update',
      context: {
        name: user.name,
        orderNumber: order.numero,
        status: newStatus,
        message: statusMessages[newStatus] || 'Status atualizado',
        trackingUrl: order.codigoRastreamento ? 
          `https://rastreamento.correios.com.br/app/index.php?objeto=${order.codigoRastreamento}` : null
      }
    });
  }

  /**
   * Enviar email de notificação administrativa
   */
  async sendAdminNotification(subject, message, data = {}) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (adminEmails.length === 0) {
      console.warn('⚠️ Nenhum email administrativo configurado');
      return;
    }

    const promises = adminEmails.map(email => 
      this.sendEmail({
        to: email.trim(),
        subject: `[ADMIN] ${subject}`,
        template: 'admin-notification',
        context: {
          subject,
          message,
          data,
          timestamp: new Date().toISOString()
        }
      })
    );

    return Promise.all(promises);
  }

  /**
   * Obter estatísticas do serviço
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.emailQueue.length,
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Limpar fila de emails
   */
  clearQueue() {
    this.emailQueue.length = 0;
    this.stats.queued = 0;
    console.log('🧹 Fila de emails limpa');
  }

  /**
   * Testar conexão SMTP
   */
  async testConnection() {
    if (!this.transporter) {
      throw new Error('Transporter não inicializado');
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Conexão SMTP OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Instância singleton
const emailService = new EmailService();

export default emailService;
