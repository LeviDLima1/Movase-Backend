/**
 * EMAIL ROUTES - Rotas do Sistema de Email
 * 
 * Define todas as rotas relacionadas ao sistema de email
 * e administração do serviço de envio
 */

import express from 'express';
import EmailController from '../controllers/EmailController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const emailController = new EmailController();

// ===== ROTAS PÚBLICAS =====

/**
 * @swagger
 * /api/email/test-connection:
 *   get:
 *     summary: Testar conexão SMTP
 *     description: Testa a conexão com o servidor SMTP configurado
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Conexão SMTP testada com sucesso
 *       400:
 *         description: Falha na conexão SMTP
 */
router.get('/test-connection',
  ErrorHandler.asyncHandler(emailController.testConnection.bind(emailController))
);

/**
 * @swagger
 * /api/email/templates:
 *   get:
 *     summary: Listar templates disponíveis
 *     description: Retorna lista de todos os templates de email disponíveis
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Lista de templates
 */
router.get('/templates',
  ErrorHandler.asyncHandler(emailController.listTemplates.bind(emailController))
);

// ===== ROTAS PROTEGIDAS (ADMIN) =====

/**
 * @swagger
 * /api/email/stats:
 *   get:
 *     summary: Obter estatísticas do serviço
 *     description: Retorna estatísticas do serviço de email (admin)
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do serviço
 *       401:
 *         description: Não autorizado
 */
router.get('/stats',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(emailController.getStats.bind(emailController))
);

/**
 * @swagger
 * /api/email/send-test:
 *   post:
 *     summary: Enviar email de teste
 *     description: Envia um email de teste para verificar o funcionamento (admin)
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - template
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "teste@exemplo.com"
 *               template:
 *                 type: string
 *                 example: "welcome"
 *               context:
 *                 type: object
 *                 example: {"name": "João Silva"}
 *     responses:
 *       200:
 *         description: Email de teste enviado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/send-test',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(emailController.sendTestEmail.bind(emailController))
);

/**
 * @swagger
 * /api/email/clear-queue:
 *   post:
 *     summary: Limpar fila de emails
 *     description: Remove todos os emails pendentes da fila (admin)
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fila limpa com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post('/clear-queue',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(emailController.clearQueue.bind(emailController))
);

/**
 * @swagger
 * /api/email/resend-verification:
 *   post:
 *     summary: Reenviar email de verificação
 *     description: Reenvia email de verificação para um usuário
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *     responses:
 *       200:
 *         description: Email de verificação reenviado
 *       400:
 *         description: Email inválido
 */
router.post('/resend-verification',
  ErrorHandler.asyncHandler(emailController.resendVerificationEmail.bind(emailController))
);

/**
 * @swagger
 * /api/email/password-reset:
 *   post:
 *     summary: Enviar email de recuperação de senha
 *     description: Envia email para recuperação de senha
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *     responses:
 *       200:
 *         description: Email de recuperação enviado
 *       400:
 *         description: Email inválido
 */
router.post('/password-reset',
  ErrorHandler.asyncHandler(emailController.sendPasswordResetEmail.bind(emailController))
);

/**
 * @swagger
 * /api/email/admin-notification:
 *   post:
 *     summary: Enviar notificação administrativa
 *     description: Envia notificação para administradores (admin)
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Alerta do Sistema"
 *               message:
 *                 type: string
 *                 example: "Houve um problema no sistema"
 *               data:
 *                 type: object
 *                 example: {"error": "Detalhes do erro"}
 *     responses:
 *       200:
 *         description: Notificação enviada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/admin-notification',
  AuthMiddleware.authenticate,
  AuthMiddleware.requireRole(['admin']),
  ErrorHandler.asyncHandler(emailController.sendAdminNotification.bind(emailController))
);

export default router;
