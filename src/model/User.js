import { DataTypes } from 'sequelize'
import connection from '../database/connection.js'

/**
 * MODELO USER (Usuários)
 * 
 * Este modelo representa os usuários do sistema.
 * Pode ser cliente, administrador, etc.
 */

const User = connection.define('User', {
  // ===== CAMPOS BÁSICOS =====
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // ===== INFORMAÇÕES PESSOAIS =====
  
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    },
    comment: 'Nome completo do usuário'
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,              // Valida formato de email
      len: [5, 255]
    },
    comment: 'Email do usuário (usado para login)'
  },

  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [10, 20]
    },
    comment: 'Telefone do usuário'
  },

  CPF: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [11, 14]               // CPF com ou sem formatação
    },
    comment: 'CPF do usuário'
  },

  // ===== SEGURANÇA =====
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]               // Senha mínima 6 caracteres
    },
    comment: 'Senha criptografada do usuário'
  },

  // ===== PERFIL E STATUS =====
  
  role: {
    type: DataTypes.ENUM('admin', 'user', 'moderator'),
    allowNull: false,
    defaultValue: 'user',
    comment: 'Papel do usuário no sistema'
  },

  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'suspenso', 'pendente'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status da conta do usuário'
  },

  // ===== INFORMAÇÕES ADICIONAIS =====
  
  dataNascimento: {
    type: DataTypes.DATEONLY,     // Apenas data, sem hora
    allowNull: true,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0]  // Não pode ser data futura
    },
    comment: 'Data de nascimento do usuário'
  },

  genero: {
    type: DataTypes.ENUM('masculino', 'feminino', 'outro', 'prefiro_nao_dizer'),
    allowNull: true,
    comment: 'Gênero do usuário'
  },

  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: 'URL da foto de perfil do usuário'
  },

  // ===== CONFIGURAÇÕES =====
  
  aceiteNewsletter: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o usuário aceita receber newsletter'
  },

  aceiteTermos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o usuário aceitou os termos de uso'
  },

  aceitePrivacidade: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o usuário aceitou a política de privacidade'
  },

  // ===== MÉTRICAS =====
  
  totalCompras: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número total de compras realizadas'
  },

  valorTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Valor total gasto em compras'
  },

  ultimaCompra: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última compra realizada'
  },

  // ===== SEGURANÇA ADICIONAL =====
  
  emailVerificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o email foi verificado'
  },

  telefoneVerificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o telefone foi verificado'
  },

  dataEmailVerificado: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data em que o email foi verificado'
  },

  dataTelefoneVerificado: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data em que o telefone foi verificado'
  },

  // ===== RECUPERAÇÃO DE SENHA =====
  
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para recuperação de senha'
  },

  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração do token de recuperação'
  },

  // ===== ÚLTIMO ACESSO =====
  
  ultimoAcesso: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora do último acesso ao sistema'
  },

  ipUltimoAcesso: {
    type: DataTypes.STRING(45),   // IPv6 pode ter até 45 caracteres
    allowNull: true,
    comment: 'IP do último acesso'
  },

  // ===== OBSERVAÇÕES =====
  
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações sobre o usuário (uso interno)'
  }

}, {
  // ===== CONFIGURAÇÕES DO MODELO =====
  
  tableName: 'users',
  timestamps: true,
  
  // ===== HOOKS =====
  
  hooks: {
    // Antes de salvar, formatar dados
    beforeSave: (user) => {
      // Formatar CPF (remover caracteres especiais)
      if (user.CPF) {
        user.CPF = user.CPF.replace(/\D/g, '');
      }
      
      // Formatar telefone (remover caracteres especiais)
      if (user.telefone) {
        user.telefone = user.telefone.replace(/\D/g, '');
      }
      
      // Converter nome para title case
      if (user.name) {
        user.name = user.name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Converter email para lowercase
      if (user.email) {
        user.email = user.email.toLowerCase();
      }
    },
    
    // Após salvar, atualizar métricas se necessário
    afterSave: (user) => {
      // Aqui você pode adicionar lógica adicional
      // como enviar emails de boas-vindas, etc.
    }
  },

  // ===== ÍNDICES =====
  
  indexes: [
    {
      fields: ['email'],           // Busca por email
      type: 'BTREE'
    },
    {
      fields: ['CPF'],             // Busca por CPF
      type: 'BTREE'
    },
    {
      fields: ['telefone'],        // Busca por telefone
      type: 'BTREE'
    },
    {
      fields: ['role'],            // Busca por papel
      type: 'BTREE'
    },
    {
      fields: ['status'],          // Busca por status
      type: 'BTREE'
    },
    {
      fields: ['emailVerificado'], // Busca por email verificado
      type: 'BTREE'
    },
    {
      fields: ['ultimoAcesso'],    // Busca por último acesso
      type: 'BTREE'
    },
    // Índices compostos
    {
      fields: ['role', 'status'],
      type: 'BTREE'
    },
    {
      fields: ['emailVerificado', 'status'],
      type: 'BTREE'
    }
  ]
});

export default User;