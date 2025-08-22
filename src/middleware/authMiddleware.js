/**
 * AUTH MIDDLEWARE - Middleware de Autenticação
 * 
 * Este middleware verifica tokens JWT e gerencia autenticação
 * de usuários na aplicação.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ResponseHandler from '../utils/responseHandler.js';
import connection from '../database/connection.js';

class AuthMiddleware {
  /**
   * Verificar se o usuário está autenticado
   */
  static async authenticate(req, res, next) {
    try {
      // Obter token do header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return ResponseHandler.unauthorized(res, 'Token de acesso não fornecido');
      }

      // Verificar formato do token (Bearer <token>)
      const parts = authHeader.split(' ');
      
      if (parts.length !== 2) {
        return ResponseHandler.unauthorized(res, 'Formato de token inválido');
      }

      const [scheme, token] = parts;

      if (!/^Bearer$/i.test(scheme)) {
        return ResponseHandler.unauthorized(res, 'Formato de token inválido');
      }

      // Verificar e decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuário no banco
      const User = connection.models.User;
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return ResponseHandler.unauthorized(res, 'Usuário não encontrado');
      }

      if (user.status !== 'ativo') {
        return ResponseHandler.forbidden(res, 'Conta desativada ou bloqueada');
      }

      // Adicionar dados do usuário à requisição
      req.user = user;
      req.userId = user.id;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return ResponseHandler.unauthorized(res, 'Token inválido');
      }
      
      if (error.name === 'TokenExpiredError') {
        return ResponseHandler.unauthorized(res, 'Token expirado');
      }
      
      console.error('Erro na autenticação:', error);
      return ResponseHandler.internalServerError(res, 'Erro na autenticação');
    }
  }

  /**
   * Verificar se o usuário tem permissão de admin
   */
  static async requireAdmin(req, res, next) {
    try {
      // Primeiro verificar se está autenticado
      await this.authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      // Verificar se é admin
      if (req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Acesso restrito a administradores');
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de admin:', error);
      return ResponseHandler.internalServerError(res, 'Erro na verificação de permissões');
    }
  }

  /**
   * Verificar se o usuário tem permissão de gerente ou admin
   */
  static async requireManager(req, res, next) {
    try {
      // Primeiro verificar se está autenticado
      await this.authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      // Verificar se é admin ou gerente
      if (!['admin', 'gerente'].includes(req.user.role)) {
        return ResponseHandler.forbidden(res, 'Acesso restrito a gerentes e administradores');
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de gerente:', error);
      return ResponseHandler.internalServerError(res, 'Erro na verificação de permissões');
    }
  }

  /**
   * Verificar se o usuário tem uma das roles especificadas
   */
  static requireRole(allowedRoles) {
    return async (req, res, next) => {
      try {
        // Primeiro verificar se está autenticado
        await this.authenticate(req, res, (err) => {
          if (err) return next(err);
        });

        // Verificar se tem uma das roles permitidas
        if (!allowedRoles.includes(req.user.role)) {
          return ResponseHandler.forbidden(res, `Acesso restrito a: ${allowedRoles.join(', ')}`);
        }

        next();
      } catch (error) {
        console.error('Erro na verificação de role:', error);
        return ResponseHandler.internalServerError(res, 'Erro na verificação de permissões');
      }
    };
  }

  /**
   * Verificar se o usuário pode acessar o recurso (próprio ou admin)
   */
  static async requireOwnershipOrAdmin(req, res, next) {
    try {
      // Primeiro verificar se está autenticado
      await this.authenticate(req, res, (err) => {
        if (err) return next(err);
      });

      const resourceUserId = parseInt(req.params.userId || req.body.userId);
      
      // Permitir se for admin ou se for o próprio usuário
      if (req.user.role === 'admin' || req.user.id === resourceUserId) {
        return next();
      }

      return ResponseHandler.forbidden(res, 'Acesso negado: você só pode acessar seus próprios dados');
    } catch (error) {
      console.error('Erro na verificação de propriedade:', error);
      return ResponseHandler.internalServerError(res, 'Erro na verificação de permissões');
    }
  }

  /**
   * Gerar token JWT
   */
  static generateToken(userId, role = 'user') {
    return jwt.sign(
      { 
        userId, 
        role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }

  /**
   * Verificar senha
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Hash de senha
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Middleware opcional de autenticação (não bloqueia se não autenticado)
   */
  static async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return next(); // Continua sem autenticação
      }

      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        return next(); // Continua sem autenticação
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const User = connection.models.User;
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.status === 'ativo') {
        req.user = user;
        req.userId = user.id;
      }

      next();
    } catch (error) {
      // Se houver erro no token, continua sem autenticação
      next();
    }
  }

  /**
   * Rate limiting básico por IP
   */
  static rateLimit(limit = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Limpar requisições antigas
      if (requests.has(ip)) {
        requests.set(ip, requests.get(ip).filter(time => time > windowStart));
      } else {
        requests.set(ip, []);
      }

      const userRequests = requests.get(ip);

      if (userRequests.length >= limit) {
        return ResponseHandler.forbidden(res, 'Limite de requisições excedido. Tente novamente em alguns minutos.');
      }

      userRequests.push(now);
      next();
    };
  }
}

export default AuthMiddleware;
