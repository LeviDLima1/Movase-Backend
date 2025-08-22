/**
 * JEST CONFIGURATION - Configuração do Jest
 * 
 * Configuração para testes automatizados
 */

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js',
  ],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  transformIgnorePatterns: [
    'node_modules/(?!(nodemailer|nodemailer-express-handlebars)/)'
  ],
};
