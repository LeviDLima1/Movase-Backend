import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ResponseHandler from '../utils/responseHandler.js';

/**
 * RATE LIMITING AVANÇADO
 * 
 * Este middleware implementa rate limiting com diferentes limites
 * para diferentes tipos de endpoints e usuários.
 */

// ===== CONFIGURAÇÕES DE RATE LIMITING =====

// Rate limiting global (todas as requisições)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requisições por IP por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    status: 429
  },
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false, // Não retorna headers legados
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Muitas requisições. Tente novamente em alguns minutos.');
  }
});

// Rate limiting para autenticação (mais restritivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por IP por janela
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Muitas tentativas de login. Tente novamente em 15 minutos.');
  },
  skipSuccessfulRequests: true, // Não conta tentativas bem-sucedidas
  keyGenerator: (req) => {
    // Usar IP + User-Agent para maior precisão (com suporte a IPv6)
    return `${ipKeyGenerator(req)}-${req.get('User-Agent')}`;
  }
});

// Rate limiting para registro de usuários
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas de registro por IP por hora
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Muitas tentativas de registro. Tente novamente em 1 hora.');
  },
  skipSuccessfulRequests: true
});

// Rate limiting para upload de imagens
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por IP por hora
  message: {
    success: false,
    message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Limite de uploads excedido. Tente novamente em 1 hora.');
  }
});

// Rate limiting para API de livros (busca)
export const booksApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // 100 requisições por IP por 5 minutos
  message: {
    success: false,
    message: 'Limite de consultas excedido. Tente novamente em 5 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Limite de consultas excedido. Tente novamente em 5 minutos.');
  }
});

// Rate limiting para carrinho de compras
export const cartLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // 50 operações no carrinho por IP por 5 minutos
  message: {
    success: false,
    message: 'Muitas operações no carrinho. Tente novamente em 5 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Muitas operações no carrinho. Tente novamente em 5 minutos.');
  }
});

// Rate limiting para compras
export const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas de compra por IP por hora
  message: {
    success: false,
    message: 'Muitas tentativas de compra. Tente novamente em 1 hora.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Muitas tentativas de compra. Tente novamente em 1 hora.');
  }
});

// Rate limiting para usuários autenticados (mais permissivo)
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requisições por usuário autenticado por janela
  message: {
    success: false,
    message: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Limite de requisições excedido. Tente novamente em alguns minutos.');
  },
  keyGenerator: (req) => {
    // Usar ID do usuário se autenticado, senão IP (com suporte a IPv6)
    return req.user ? `user-${req.user.id}` : ipKeyGenerator(req);
  },
  skip: (req) => {
    // Pular se não há usuário autenticado (será aplicado o limiter global)
    return !req.user;
  }
});

// Rate limiting para admin (muito permissivo)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requisições por admin por janela
  message: {
    success: false,
    message: 'Limite de requisições excedido.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ResponseHandler.tooManyRequests(res, 'Limite de requisições excedido.');
  },
  keyGenerator: (req) => {
    return `admin-${req.user.id}`;
  },
  skip: (req) => {
    // Pular se não é admin
    return !req.user || req.user.role !== 'admin';
  }
});

// ===== FUNÇÕES AUXILIARES =====

/**
 * Middleware para aplicar rate limiting baseado no tipo de usuário
 */
export const dynamicRateLimit = (req, res, next) => {
  // Se é admin, aplicar limiter de admin
  if (req.user && req.user.role === 'admin') {
    return adminLimiter(req, res, next);
  }
  
  // Se é usuário autenticado, aplicar limiter de usuário
  if (req.user) {
    return authenticatedLimiter(req, res, next);
  }
  
  // Se não é autenticado, aplicar limiter global
  return globalLimiter(req, res, next);
};

/**
 * Middleware para aplicar rate limiting baseado na rota
 */
export const routeBasedRateLimit = (req, res, next) => {
  const path = req.path;
  
  // Aplicar limiters específicos baseado na rota
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    return authLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/auth/register')) {
    return registerLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/images/upload')) {
    return uploadLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/books')) {
    return booksApiLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/cart')) {
    return cartLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/purchases')) {
    return purchaseLimiter(req, res, next);
  }
  
  // Para outras rotas, usar limiter dinâmico
  return dynamicRateLimit(req, res, next);
};

export default {
  globalLimiter,
  authLimiter,
  registerLimiter,
  uploadLimiter,
  booksApiLimiter,
  cartLimiter,
  purchaseLimiter,
  authenticatedLimiter,
  adminLimiter,
  dynamicRateLimit,
  routeBasedRateLimit
};
