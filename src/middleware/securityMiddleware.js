import helmet from 'helmet';
import ResponseHandler from '../utils/responseHandler.js';

/**
 * MIDDLEWARE DE SEGURANÇA
 * 
 * Este middleware implementa headers de segurança usando Helmet.js
 * e outras medidas de segurança para proteger a aplicação.
 */

// ===== CONFIGURAÇÃO DO HELMET =====

export const helmetConfig = helmet({
  // Headers de segurança básicos
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  
  // Prevenir clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // Prevenir MIME type sniffing
  noSniff: true,
  
  // Prevenir XSS
  xssFilter: true,
  
  // Forçar HTTPS em produção
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // Remover headers que podem vazar informações
  hidePoweredBy: true,
  
  // Prevenir ataques de injeção de conteúdo
  ieNoOpen: true,
  
  // Configurações de referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

// ===== MIDDLEWARE DE SANITIZAÇÃO =====

/**
 * Sanitizar dados de entrada
 */
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizar body
    if (req.body) {
      sanitizeObject(req.body);
    }
    
    // Sanitizar query parameters
    if (req.query) {
      console.log('🔍 Query params antes da sanitização:', req.query);
      sanitizeObject(req.query);
      console.log('✅ Query params após sanitização:', req.query);
    }
    
    // Sanitizar params
    if (req.params) {
      sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro na sanitização:', error);
    console.error('❌ Stack trace:', error.stack);
    return ResponseHandler.badRequest(res, 'Dados inválidos detectados');
  }
};

/**
 * Função recursiva para sanitizar objetos
 */
function sanitizeObject(obj) {
  for (let key in obj) {
    // Usar Object.prototype.hasOwnProperty.call para objetos sem prototype
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // Remover caracteres perigosos
        obj[key] = obj[key]
          .replace(/[<>]/g, '') // Remover < e >
          .replace(/javascript:/gi, '') // Remover javascript:
          .replace(/on\w+=/gi, '') // Remover event handlers
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
      // Para números, booleanos e outros tipos, não fazer nada (manter como estão)
    }
  }
}

// ===== MIDDLEWARE DE VALIDAÇÃO DE ARQUIVOS =====

/**
 * Validar tipos de arquivo permitidos
 */
export const validateFileType = (allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }
    
    const fileType = req.file.mimetype;
    
    if (!allowedTypes.includes(fileType)) {
      return ResponseHandler.badRequest(res, `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }
    
    // Validar extensão do arquivo
    const fileName = req.file.originalname;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      return ResponseHandler.badRequest(res, `Extensão de arquivo não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`);
    }
    
    next();
  };
};

// ===== MIDDLEWARE DE LOGS DE AUDITORIA =====

/**
 * Log de auditoria para ações críticas
 */
export const auditLog = (action) => {
  return (req, res, next) => {
    const auditData = {
      timestamp: new Date().toISOString(),
      action: action,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      userEmail: req.user?.email || 'anonymous',
      requestBody: req.method !== 'GET' ? req.body : null,
      queryParams: Object.keys(req.query).length > 0 ? req.query : null
    };
    
    // Log para console (em produção, usar um sistema de logs)
    console.log('🔒 AUDIT LOG:', JSON.stringify(auditData, null, 2));
    
    // Adicionar dados de auditoria à requisição
    req.auditData = auditData;
    
    next();
  };
};

// ===== MIDDLEWARE DE VALIDAÇÃO DE TOKENS =====

/**
 * Validar expiração de tokens JWT
 */
export const validateTokenExpiration = (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }
    
    // Verificar se o token está próximo de expirar (5 minutos)
    const tokenExp = req.user.exp;
    if (tokenExp) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenExp - now;
      
      // Se faltam menos de 5 minutos para expirar, adicionar header de aviso
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        res.setHeader('X-Token-Expiry-Warning', `Token expira em ${timeUntilExpiry} segundos`);
      }
      
      // Se já expirou, retornar erro
      if (timeUntilExpiry <= 0) {
        return ResponseHandler.unauthorized(res, 'Token expirado');
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro na validação de token:', error);
    return ResponseHandler.unauthorized(res, 'Token inválido');
  }
};

// ===== MIDDLEWARE DE PREVENÇÃO DE ATAQUES =====

/**
 * Prevenir ataques de força bruta
 */
export const bruteForceProtection = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar tentativas antigas
    if (attempts.has(key)) {
      attempts.set(key, attempts.get(key).filter(time => time > windowStart));
    } else {
      attempts.set(key, []);
    }
    
    const currentAttempts = attempts.get(key);
    
    if (currentAttempts.length >= maxAttempts) {
      return ResponseHandler.tooManyRequests(res, 'Muitas tentativas. Tente novamente em alguns minutos.');
    }
    
    // Adicionar tentativa atual
    currentAttempts.push(now);
    
    next();
  };
};

// ===== MIDDLEWARE DE HEADERS PERSONALIZADOS =====

/**
 * Headers de segurança personalizados
 */
export const customSecurityHeaders = (req, res, next) => {
  // Headers adicionais de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Header para indicar que é uma API
  res.setHeader('X-API-Version', '1.0.0');
  
  // Header para indicar ambiente
  res.setHeader('X-Environment', process.env.NODE_ENV || 'development');
  
  next();
};

export default {
  helmetConfig,
  sanitizeInput,
  validateFileType,
  auditLog,
  validateTokenExpiration,
  bruteForceProtection,
  customSecurityHeaders
};
