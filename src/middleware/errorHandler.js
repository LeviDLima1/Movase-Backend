/**
 * ERROR HANDLER MIDDLEWARE - Tratamento de Erros
 * 
 * Este middleware captura e trata erros de forma padronizada
 * em toda a aplicação.
 */

import ResponseHandler from '../utils/responseHandler.js';

class ErrorHandler {
  /**
   * Middleware para capturar erros assíncronos
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Rate limiting básico
   */
  static rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();
    
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Limpar requisições antigas
      if (requests.has(ip)) {
        requests.set(ip, requests.get(ip).filter(time => time > windowStart));
      } else {
        requests.set(ip, []);
      }
      
      const currentRequests = requests.get(ip);
      
      if (currentRequests.length >= maxRequests) {
        return ResponseHandler.tooManyRequests(res, 'Muitas requisições. Tente novamente em alguns minutos.');
      }
      
      currentRequests.push(now);
      next();
    };
  }

  /**
   * Timeout de requisições
   */
  static timeout(ms = 30000) {
    return (req, res, next) => {
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          ResponseHandler.timeout(res, 'Tempo limite da requisição excedido');
        }
      }, ms);
      
      res.on('finish', () => clearTimeout(timer));
      next();
    };
  }

  /**
   * Headers de segurança
   */
  static security() {
    return (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    };
  }

  /**
   * CORS
   */
  static cors() {
    return (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    };
  }

  /**
   * Logging de requisições
   */
  static requestLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  }

  /**
   * Middleware principal de tratamento de erros
   */
  static handleError(err, req, res, next) {
    console.error('Erro capturado:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Erros de validação do Sequelize
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      
      return ResponseHandler.unprocessableEntity(
        res, 
        'Dados inválidos', 
        errors
      );
    }

    // Erros de restrição única do Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path || 'campo';
      const message = `${field} já existe no sistema`;
      
      return ResponseHandler.conflict(res, message);
    }

    // Erros de chave estrangeira do Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return ResponseHandler.badRequest(
        res, 
        'Referência inválida: o recurso relacionado não existe'
      );
    }

    // Erros de conexão com banco
    if (err.name === 'SequelizeConnectionError') {
      return ResponseHandler.internalServerError(
        res, 
        'Erro de conexão com o banco de dados'
      );
    }

    // Erros de timeout
    if (err.name === 'SequelizeTimeoutError') {
      return ResponseHandler.internalServerError(
        res, 
        'Timeout na operação do banco de dados'
      );
    }

    // Erros de JWT
    if (err.name === 'JsonWebTokenError') {
      return ResponseHandler.unauthorized(res, 'Token inválido');
    }

    if (err.name === 'TokenExpiredError') {
      return ResponseHandler.unauthorized(res, 'Token expirado');
    }

    // Erros de validação customizados
    if (err.name === 'ValidationError') {
      return ResponseHandler.badRequest(res, err.message);
    }

    // Erros de não encontrado
    if (err.name === 'NotFoundError') {
      return ResponseHandler.notFound(res, err.message);
    }

    // Erros de permissão
    if (err.name === 'PermissionError') {
      return ResponseHandler.forbidden(res, err.message);
    }

    // Erros de negócio
    if (err.name === 'BusinessError') {
      return ResponseHandler.unprocessableEntity(res, err.message);
    }

    // Erros de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return ResponseHandler.badRequest(res, 'JSON inválido no corpo da requisição');
    }

    // Erros de limite de tamanho
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ResponseHandler.badRequest(res, 'Arquivo muito grande');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return ResponseHandler.badRequest(res, 'Campo de arquivo inesperado');
    }

    // Erro genérico (padrão)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return ResponseHandler.internalServerError(
      res,
      'Erro interno do servidor',
      isDevelopment ? err.message : null
    );
  }

  /**
   * Middleware para rotas não encontradas
   */
  static notFound(req, res, next) {
    return ResponseHandler.notFound(
      res, 
      `Rota ${req.method} ${req.originalUrl} não encontrada`
    );
  }

  /**
   * Middleware para métodos não permitidos
   */
  static methodNotAllowed(req, res, next) {
    return ResponseHandler.forbidden(
      res, 
      `Método ${req.method} não permitido para ${req.originalUrl}`
    );
  }

  /**
   * Middleware para timeout de requisições
   */
  static timeout(timeoutMs = 30000) {
    return (req, res, next) => {
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          return ResponseHandler.internalServerError(
            res, 
            'Timeout da requisição'
          );
        }
      }, timeoutMs);

      res.on('finish', () => {
        clearTimeout(timer);
      });

      next();
    };
  }

  /**
   * Middleware para logging de requisições
   */
  static requestLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
      
      console.log(`${logLevel} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
  }

  /**
   * Middleware para CORS
   */
  static cors() {
    return (req, res, next) => {
      res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', true);

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    };
  }

  /**
   * Middleware para segurança básica
   */
  static security() {
    return (req, res, next) => {
      // Remover headers que podem expor informações
      res.removeHeader('X-Powered-By');
      
      // Adicionar headers de segurança
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Content Security Policy básico
      res.header('Content-Security-Policy', "default-src 'self'");
      
      next();
    };
  }
}

export default ErrorHandler;
