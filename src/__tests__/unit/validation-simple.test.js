/**
 * VALIDATION SIMPLE TEST - Teste Simples do ValidationUtils
 * 
 * Teste básico para o sistema de validação
 */

import ValidationUtils from '../../utils/validation.js';

describe('ValidationUtils - Testes Simples', () => {
  describe('required()', () => {
    test('deve retornar true para valores válidos', () => {
      expect(ValidationUtils.required('teste', 'Campo')).toBe(true);
      expect(ValidationUtils.required(123, 'Campo')).toBe(true);
      expect(ValidationUtils.required(0, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores inválidos', () => {
      expect(() => ValidationUtils.required('', 'Campo')).toThrow('Campo é obrigatório');
      expect(() => ValidationUtils.required(null, 'Campo')).toThrow('Campo é obrigatório');
    });
  });

  describe('email()', () => {
    test('deve retornar true para emails válidos', () => {
      expect(ValidationUtils.email('teste@exemplo.com', 'Email')).toBe(true);
      expect(ValidationUtils.email('user.name@domain.co.uk', 'Email')).toBe(true);
    });

    test('deve retornar true para email vazio (opcional)', () => {
      expect(ValidationUtils.email('', 'Email')).toBe(true);
      expect(ValidationUtils.email(null, 'Email')).toBe(true);
    });

    test('deve lançar erro para emails inválidos', () => {
      expect(() => ValidationUtils.email('email-invalido', 'Email')).toThrow('Email deve ser um email válido');
      expect(() => ValidationUtils.email('@exemplo.com', 'Email')).toThrow('Email deve ser um email válido');
    });
  });

  describe('minLength()', () => {
    test('deve retornar true para strings com tamanho mínimo', () => {
      expect(ValidationUtils.minLength('teste', 3, 'Campo')).toBe(true);
      expect(ValidationUtils.minLength('teste', 5, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.minLength('', 3, 'Campo')).toBe(true);
      expect(ValidationUtils.minLength(null, 3, 'Campo')).toBe(true);
    });

    test('deve lançar erro para strings muito curtas', () => {
      expect(() => ValidationUtils.minLength('ab', 3, 'Campo')).toThrow('Campo deve ter pelo menos 3 caracteres');
    });
  });

  describe('isNumber()', () => {
    test('deve retornar true para números válidos', () => {
      expect(ValidationUtils.isNumber(123, 'Campo')).toBe(true);
      expect(ValidationUtils.isNumber(0, 'Campo')).toBe(true);
      expect(ValidationUtils.isNumber(-123, 'Campo')).toBe(true);
      expect(ValidationUtils.isNumber(123.45, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.isNumber('', 'Campo')).toBe(true);
      expect(ValidationUtils.isNumber(null, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores não numéricos', () => {
      expect(() => ValidationUtils.isNumber('abc', 'Campo')).toThrow('Campo deve ser um número válido');
      expect(() => ValidationUtils.isNumber('123abc', 'Campo')).toThrow('Campo deve ser um número válido');
    });
  });
});
