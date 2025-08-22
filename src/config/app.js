/**
 * APP CONFIG - Configurações da Aplicação
 * 
 * Este arquivo centraliza todas as configurações da aplicação
 * baseadas nas variáveis de ambiente.
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const config = {
  // ===== SERVIDOR =====
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // ===== BANCO DE DADOS =====
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'movase',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '0000',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  },

  // ===== AUTENTICAÇÃO =====
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'movase_jwt_secret_key_2024_very_secure',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6
  },

  // ===== CORS =====
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  },

  // ===== RATE LIMITING =====
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requisições por janela
    message: 'Limite de requisições excedido. Tente novamente em alguns minutos.'
  },

  // ===== UPLOAD =====
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // ===== EMAIL =====
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@movase.com'
  },

  // ===== PAGINAÇÃO =====
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 10,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100
  },

  // ===== LOGGING =====
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // ===== CACHE =====
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutos
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600 // 10 minutos
  },

  // ===== SEGURANÇA =====
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    sessionSecret: process.env.SESSION_SECRET || 'movase_session_secret',
    cookieSecret: process.env.COOKIE_SECRET || 'movase_cookie_secret',
    csrfEnabled: process.env.CSRF_ENABLED === 'true',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false'
  }
};

export default config;
