/**
 * TEST SETUP - Configuração Global dos Testes
 * 
 * Configurações e setup global para todos os testes
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente de teste
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'movase_test';
process.env.PORT = '3002';

// Configurações globais do Jest
global.console = {
  ...console,
  // Suprimir logs durante os testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout global para testes
jest.setTimeout(10000);

// Configurações globais
global.testConfig = {
  baseURL: 'http://localhost:3002',
  apiURL: 'http://localhost:3002/api',
  testUser: {
    email: 'test@movase.com',
    password: 'test123',
    name: 'Usuário Teste',
    CPF: '12345678901',
    telefone: '11999999999'
  },
  adminUser: {
    email: 'admin@movase.com',
    password: 'admin123',
    name: 'Administrador',
    CPF: '98765432100',
    telefone: '11888888888'
  }
};

// Funções utilitárias para testes
global.testUtils = {
  // Gerar dados de teste únicos
  generateUniqueEmail: () => `test-${Date.now()}@movase.com`,
  generateUniqueCPF: () => `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
  generateUniquePhone: () => `11${Math.floor(Math.random() * 90000000) + 10000000}`,
  
  // Aguardar tempo específico
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Limpar dados de teste
  cleanup: async () => {
    // Implementar limpeza de dados de teste
    console.log('🧹 Limpeza de dados de teste concluída');
  }
};

// Hook para limpeza após cada teste
afterEach(async () => {
  // Limpar mocks
  jest.clearAllMocks();
  
  // Aguardar um pouco para evitar conflitos
  await global.testUtils.wait(100);
});

// Hook para limpeza após todos os testes
afterAll(async () => {
  // Limpeza final
  await global.testUtils.cleanup();
  
  // Aguardar um pouco antes de finalizar
  await global.testUtils.wait(500);
});

console.log('🧪 Setup de testes configurado com sucesso!');
