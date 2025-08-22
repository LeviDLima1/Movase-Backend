/**
 * VALIDATION UTILS TESTS - Testes Unitários
 * 
 * Testes para o sistema de validação
 */

import ValidationUtils from '../../utils/validation.js';

describe('ValidationUtils', () => {
  describe('required()', () => {
    test('deve retornar true para valores válidos', () => {
      expect(ValidationUtils.required('teste', 'Campo')).toBe(true);
      expect(ValidationUtils.required(123, 'Campo')).toBe(true);
      expect(ValidationUtils.required(0, 'Campo')).toBe(true);
      expect(ValidationUtils.required(false, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores inválidos', () => {
      expect(() => ValidationUtils.required('', 'Campo')).toThrow('Campo é obrigatório');
      expect(() => ValidationUtils.required(null, 'Campo')).toThrow('Campo é obrigatório');
      expect(() => ValidationUtils.required(undefined, 'Campo')).toThrow('Campo é obrigatório');
    });
  });

  describe('email()', () => {
    test('deve retornar true para emails válidos', () => {
      expect(ValidationUtils.email('teste@exemplo.com', 'Email')).toBe(true);
      expect(ValidationUtils.email('user.name@domain.co.uk', 'Email')).toBe(true);
      expect(ValidationUtils.email('test+tag@exemplo.com', 'Email')).toBe(true);
    });

    test('deve retornar true para email vazio (opcional)', () => {
      expect(ValidationUtils.email('', 'Email')).toBe(true);
      expect(ValidationUtils.email(null, 'Email')).toBe(true);
    });

    test('deve lançar erro para emails inválidos', () => {
      expect(() => ValidationUtils.email('email-invalido', 'Email')).toThrow('Email deve ser um email válido');
      expect(() => ValidationUtils.email('@exemplo.com', 'Email')).toThrow('Email deve ser um email válido');
      expect(() => ValidationUtils.email('teste@', 'Email')).toThrow('Email deve ser um email válido');
      expect(() => ValidationUtils.email('teste.exemplo.com', 'Email')).toThrow('Email deve ser um email válido');
    });
  });

  describe('cpf()', () => {
    test('deve retornar true para CPFs válidos', () => {
      expect(ValidationUtils.cpf('52998224725', 'CPF')).toBe(true);
      expect(ValidationUtils.cpf('11144477735', 'CPF')).toBe(true);
    });

    test('deve retornar true para CPF vazio (opcional)', () => {
      expect(ValidationUtils.cpf('', 'CPF')).toBe(true);
      expect(ValidationUtils.cpf(null, 'CPF')).toBe(true);
    });

    test('deve lançar erro para CPFs inválidos', () => {
      expect(() => ValidationUtils.cpf('1234567890', 'CPF')).toThrow('CPF deve ter 11 dígitos');
      expect(() => ValidationUtils.cpf('123456789012', 'CPF')).toThrow('CPF deve ter 11 dígitos');
      expect(() => ValidationUtils.cpf('11111111111', 'CPF')).toThrow('CPF inválido');
      expect(() => ValidationUtils.cpf('12345678901', 'CPF')).toThrow('CPF inválido');
    });
  });

  describe('phone()', () => {
    test('deve retornar true para telefones válidos', () => {
      expect(ValidationUtils.phone('11999999999', 'Telefone')).toBe(true);
      expect(ValidationUtils.phone('1199999999', 'Telefone')).toBe(true);
    });

    test('deve retornar true para telefone vazio (opcional)', () => {
      expect(ValidationUtils.phone('', 'Telefone')).toBe(true);
      expect(ValidationUtils.phone(null, 'Telefone')).toBe(true);
    });

    test('deve lançar erro para telefones inválidos', () => {
      expect(() => ValidationUtils.phone('123456789', 'Telefone')).toThrow('Telefone deve ter 10 ou 11 dígitos');
      expect(() => ValidationUtils.phone('123456789012', 'Telefone')).toThrow('Telefone deve ter 10 ou 11 dígitos');
    });
  });

  describe('cep()', () => {
    test('deve retornar true para CEPs válidos', () => {
      expect(ValidationUtils.cep('12345678', 'CEP')).toBe(true);
      expect(ValidationUtils.cep('01234567', 'CEP')).toBe(true);
    });

    test('deve retornar true para CEP vazio (opcional)', () => {
      expect(ValidationUtils.cep('', 'CEP')).toBe(true);
      expect(ValidationUtils.cep(null, 'CEP')).toBe(true);
    });

    test('deve lançar erro para CEPs inválidos', () => {
      expect(() => ValidationUtils.cep('1234567', 'CEP')).toThrow('CEP deve ter 8 dígitos');
      expect(() => ValidationUtils.cep('123456789', 'CEP')).toThrow('CEP deve ter 8 dígitos');
    });
  });

  describe('uf()', () => {
    test('deve retornar true para UFs válidas', () => {
      expect(ValidationUtils.uf('SP', 'UF')).toBe(true);
      expect(ValidationUtils.uf('RJ', 'UF')).toBe(true);
      expect(ValidationUtils.uf('MG', 'UF')).toBe(true);
    });

    test('deve retornar true para UF vazia (opcional)', () => {
      expect(ValidationUtils.uf('', 'UF')).toBe(true);
      expect(ValidationUtils.uf(null, 'UF')).toBe(true);
    });

    test('deve lançar erro para UFs inválidas', () => {
      expect(() => ValidationUtils.uf('ABC', 'UF')).toThrow('UF deve ser uma UF válida');
      expect(() => ValidationUtils.uf('A', 'UF')).toThrow('UF deve ser uma UF válida');
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

  describe('maxLength()', () => {
    test('deve retornar true para strings com tamanho máximo', () => {
      expect(ValidationUtils.maxLength('teste', 10, 'Campo')).toBe(true);
      expect(ValidationUtils.maxLength('teste', 5, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.maxLength('', 3, 'Campo')).toBe(true);
      expect(ValidationUtils.maxLength(null, 3, 'Campo')).toBe(true);
    });

    test('deve lançar erro para strings muito longas', () => {
      expect(() => ValidationUtils.maxLength('teste muito longo', 5, 'Campo')).toThrow('Campo deve ter no máximo 5 caracteres');
    });
  });

  describe('minValue()', () => {
    test('deve retornar true para valores mínimos', () => {
      expect(ValidationUtils.minValue(10, 5, 'Campo')).toBe(true);
      expect(ValidationUtils.minValue(10, 10, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.minValue('', 5, 'Campo')).toBe(true);
      expect(ValidationUtils.minValue(null, 5, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores muito baixos', () => {
      expect(() => ValidationUtils.minValue(3, 5, 'Campo')).toThrow('Campo deve ser maior ou igual a 5');
    });
  });

  describe('maxValue()', () => {
    test('deve retornar true para valores máximos', () => {
      expect(ValidationUtils.maxValue(5, 10, 'Campo')).toBe(true);
      expect(ValidationUtils.maxValue(10, 10, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.maxValue('', 10, 'Campo')).toBe(true);
      expect(ValidationUtils.maxValue(null, 10, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores muito altos', () => {
      expect(() => ValidationUtils.maxValue(15, 10, 'Campo')).toThrow('Campo deve ser menor ou igual a 10');
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
      expect(() => ValidationUtils.isNumber('abc', 'Campo')).toThrow('Campo deve ser um número');
      expect(() => ValidationUtils.isNumber('123abc', 'Campo')).toThrow('Campo deve ser um número');
    });
  });

  describe('isInteger()', () => {
    test('deve retornar true para inteiros válidos', () => {
      expect(ValidationUtils.isInteger(123, 'Campo')).toBe(true);
      expect(ValidationUtils.isInteger(0, 'Campo')).toBe(true);
      expect(ValidationUtils.isInteger(-123, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.isInteger('', 'Campo')).toBe(true);
      expect(ValidationUtils.isInteger(null, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores não inteiros', () => {
      expect(() => ValidationUtils.isInteger(123.45, 'Campo')).toThrow('Campo deve ser um número inteiro');
      expect(() => ValidationUtils.isInteger('abc', 'Campo')).toThrow('Campo deve ser um número inteiro');
    });
  });

  describe('isPositive()', () => {
    test('deve retornar true para valores positivos', () => {
      expect(ValidationUtils.isPositive(123, 'Campo')).toBe(true);
      expect(ValidationUtils.isPositive(0.1, 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.isPositive('', 'Campo')).toBe(true);
      expect(ValidationUtils.isPositive(null, 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores não positivos', () => {
      expect(() => ValidationUtils.isPositive(0, 'Campo')).toThrow('Campo deve ser um valor positivo');
      expect(() => ValidationUtils.isPositive(-123, 'Campo')).toThrow('Campo deve ser um valor positivo');
    });
  });

  describe('inList()', () => {
    test('deve retornar true para valores na lista', () => {
      expect(ValidationUtils.inList('ativo', ['ativo', 'inativo'], 'Campo')).toBe(true);
      expect(ValidationUtils.inList('admin', ['user', 'admin', 'moderator'], 'Campo')).toBe(true);
    });

    test('deve retornar true para valor vazio (opcional)', () => {
      expect(ValidationUtils.inList('', ['ativo', 'inativo'], 'Campo')).toBe(true);
      expect(ValidationUtils.inList(null, ['ativo', 'inativo'], 'Campo')).toBe(true);
    });

    test('deve lançar erro para valores fora da lista', () => {
      expect(() => ValidationUtils.inList('invalid', ['ativo', 'inativo'], 'Campo')).toThrow('Campo deve ser um dos valores: ativo, inativo');
    });
  });

  describe('url()', () => {
    test('deve retornar true para URLs válidas', () => {
      expect(ValidationUtils.url('https://exemplo.com', 'Campo')).toBe(true);
      expect(ValidationUtils.url('http://exemplo.com/path', 'Campo')).toBe(true);
      expect(ValidationUtils.url('https://exemplo.com/path?param=value', 'Campo')).toBe(true);
    });

    test('deve retornar true para URL vazia (opcional)', () => {
      expect(ValidationUtils.url('', 'Campo')).toBe(true);
      expect(ValidationUtils.url(null, 'Campo')).toBe(true);
    });

    test('deve lançar erro para URLs inválidas', () => {
      expect(() => ValidationUtils.url('not-a-url', 'Campo')).toThrow('Campo deve ser uma URL válida');
      expect(() => ValidationUtils.url('exemplo.com', 'Campo')).toThrow('Campo deve ser uma URL válida');
    });
  });

  describe('date()', () => {
    test('deve retornar true para datas válidas', () => {
      expect(ValidationUtils.date('2023-12-31', 'Campo')).toBe(true);
      expect(ValidationUtils.date('2023-01-01', 'Campo')).toBe(true);
    });

    test('deve retornar true para data vazia (opcional)', () => {
      expect(ValidationUtils.date('', 'Campo')).toBe(true);
      expect(ValidationUtils.date(null, 'Campo')).toBe(true);
    });

    test('deve lançar erro para datas inválidas', () => {
      expect(() => ValidationUtils.date('2023-13-01', 'Campo')).toThrow('Campo deve ser uma data válida');
      expect(() => ValidationUtils.date('invalid-date', 'Campo')).toThrow('Campo deve ser uma data válida');
    });
  });
});
