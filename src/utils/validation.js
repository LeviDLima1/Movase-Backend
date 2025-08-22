/**
 * VALIDATION UTILS - Sistema de Validação
 * 
 * Este módulo fornece funções de validação reutilizáveis
 * para validar dados de entrada da API.
 */

import ResponseHandler from './responseHandler.js';

class ValidationUtils {
  /**
   * Validar se um campo é obrigatório
   */
  static required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} é obrigatório`);
    }
    return true;
  }

  /**
   * Validar email
   */
  static email(value, fieldName = 'Email') {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`${fieldName} deve ser um email válido`);
    }
    return true;
  }

  /**
   * Validar CPF
   */
  static cpf(value, fieldName = 'CPF') {
    if (value) {
      // Remove caracteres não numéricos
      const cpf = value.replace(/\D/g, '');
      
      if (cpf.length !== 11) {
        throw new Error(`${fieldName} deve ter 11 dígitos`);
      }
      
      // Verificar se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) {
        throw new Error(`${fieldName} inválido`);
      }
      
      // Em desenvolvimento, aceitar CPFs comuns para teste
      if (process.env.NODE_ENV === 'development') {
        const testCpfs = ['11111111111', '22222222222', '33333333333', '44444444444', '55555555555'];
        if (testCpfs.includes(cpf)) {
          return true;
        }
      }
      
      // Validar dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = sum % 11;
      let digit1 = remainder < 2 ? 0 : 11 - remainder;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = sum % 11;
      let digit2 = remainder < 2 ? 0 : 11 - remainder;
      
      if (parseInt(cpf.charAt(9)) !== digit1 || parseInt(cpf.charAt(10)) !== digit2) {
        throw new Error(`${fieldName} inválido`);
      }
    }
    return true;
  }

  /**
   * Validar telefone
   */
  static phone(value, fieldName = 'Telefone') {
    if (value) {
      const phone = value.replace(/\D/g, '');
      if (phone.length < 10 || phone.length > 11) {
        throw new Error(`${fieldName} deve ter 10 ou 11 dígitos`);
      }
    }
    return true;
  }

  /**
   * Validar CEP
   */
  static cep(value, fieldName = 'CEP') {
    if (value) {
      const cep = value.replace(/\D/g, '');
      if (cep.length !== 8) {
        throw new Error(`${fieldName} deve ter 8 dígitos`);
      }
    }
    return true;
  }

  /**
   * Validar UF
   */
  static uf(value, fieldName = 'UF') {
    if (value) {
      const ufs = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];
      
      if (!ufs.includes(value.toUpperCase())) {
        throw new Error(`${fieldName} deve ser uma UF válida`);
      }
    }
    return true;
  }

  /**
   * Validar tamanho mínimo
   */
  static minLength(value, min, fieldName) {
    if (value && value.length < min) {
      throw new Error(`${fieldName} deve ter pelo menos ${min} caracteres`);
    }
    return true;
  }

  /**
   * Validar tamanho máximo
   */
  static maxLength(value, max, fieldName) {
    if (value && value.length > max) {
      throw new Error(`${fieldName} deve ter no máximo ${max} caracteres`);
    }
    return true;
  }

  /**
   * Validar valor mínimo
   */
  static minValue(value, min, fieldName) {
    if (value !== undefined && value !== null && parseFloat(value) < min) {
      throw new Error(`${fieldName} deve ser maior ou igual a ${min}`);
    }
    return true;
  }

  /**
   * Validar valor máximo
   */
  static maxValue(value, max, fieldName) {
    if (value !== undefined && value !== null && parseFloat(value) > max) {
      throw new Error(`${fieldName} deve ser menor ou igual a ${max}`);
    }
    return true;
  }

  /**
   * Validar se é número
   */
  static isNumber(value, fieldName) {
    if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
      throw new Error(`${fieldName} deve ser um número válido`);
    }
    return true;
  }

  /**
   * Validar se é inteiro
   */
  static isInteger(value, fieldName) {
    if (value !== undefined && value !== null && value !== '' && !Number.isInteger(parseFloat(value))) {
      throw new Error(`${fieldName} deve ser um número inteiro`);
    }
    return true;
  }

  /**
   * Validar se é positivo
   */
  static isPositive(value, fieldName) {
    if (value !== undefined && value !== null && value !== '' && parseFloat(value) <= 0) {
      throw new Error(`${fieldName} deve ser um valor positivo`);
    }
    return true;
  }

  /**
   * Validar se está em uma lista de valores permitidos
   */
  static inList(value, allowedValues, fieldName) {
    if (value && !allowedValues.includes(value)) {
      throw new Error(`${fieldName} deve ser um dos valores: ${allowedValues.join(', ')}`);
    }
    return true;
  }

  /**
   * Validar senha
   */
  static password(value, fieldName = 'Senha') {
    if (value) {
      if (value.length < 6) {
        throw new Error(`${fieldName} deve ter pelo menos 6 caracteres`);
      }
      
      // Opcional: adicionar mais regras de senha
      // if (!/(?=.*[a-z])/.test(value)) {
      //   throw new Error(`${fieldName} deve conter pelo menos uma letra minúscula`);
      // }
      // if (!/(?=.*[A-Z])/.test(value)) {
      //   throw new Error(`${fieldName} deve conter pelo menos uma letra maiúscula`);
      // }
      // if (!/(?=.*\d)/.test(value)) {
      //   throw new Error(`${fieldName} deve conter pelo menos um número`);
      // }
    }
    return true;
  }

  /**
   * Validar formato de data
   */
  static date(value, fieldName = 'Data') {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`${fieldName} deve ser uma data válida`);
      }
    }
    return true;
  }

  /**
   * Validar se é uma URL válida
   */
  static url(value, fieldName = 'URL') {
    if (value) {
      try {
        new URL(value);
      } catch {
        throw new Error(`${fieldName} deve ser uma URL válida`);
      }
    }
    return true;
  }

  /**
   * Validar múltiplos campos de uma vez
   */
  static validateFields(data, rules) {
    const errors = [];
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      
      for (const rule of fieldRules) {
        try {
          if (typeof rule === 'function') {
            rule(value, field);
          } else if (typeof rule === 'string') {
            this[rule](value, field);
          } else if (typeof rule === 'object') {
            const { validator, ...params } = rule;
            this[validator](value, field, ...Object.values(params));
          }
        } catch (error) {
          errors.push(error.message);
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
    
    return true;
  }

  /**
   * Middleware para validar dados de entrada
   */
  static validate(schema) {
    return (req, res, next) => {
      try {
        const data = { ...req.body, ...req.params, ...req.query };
        this.validateFields(data, schema);
        next();
      } catch (error) {
        return ResponseHandler.badRequest(res, 'Dados inválidos', error.message);
      }
    };
  }
}

export default ValidationUtils;
