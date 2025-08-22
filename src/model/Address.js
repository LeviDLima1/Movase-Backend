import { DataTypes } from "sequelize";
import connection from "../database/connection.js";

/**
 * MODELO ADDRESS (Endereços)
 * 
 * Este modelo representa os endereços dos usuários.
 * Um usuário pode ter múltiplos endereços (cobrança, entrega, etc.)
 */

const Address = connection.define('Address', {
  // ===== CAMPOS BÁSICOS =====
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // ===== RELACIONAMENTO COM USUÁRIO =====
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',        // Nome da tabela referenciada (minúsculo)
      key: 'id'              // Campo referenciado
    },
    comment: 'ID do usuário proprietário do endereço'
  },

  // ===== INFORMAÇÕES DO ENDEREÇO =====
  
  cep: {
    type: DataTypes.STRING(8),    // CEP tem 8 dígitos
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 8],               // Exatamente 8 caracteres
      is: /^\d{8}$/              // Regex: apenas números
    },
    comment: 'CEP do endereço (apenas números)'
  },

  logradouro: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    },
    comment: 'Nome da rua, avenida, etc.'
  },

  numero: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 20]
    },
    comment: 'Número do endereço'
  },

  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Complemento: apartamento, bloco, etc.'
  },

  bairro: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    },
    comment: 'Bairro do endereço'
  },

  cidade: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    },
    comment: 'Cidade do endereço'
  },

  uf: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 2],               // Exatamente 2 caracteres
      is: /^[A-Z]{2}$/           // Regex: apenas letras maiúsculas
    },
    comment: 'Estado (UF) do endereço'
  },

  // ===== CONFIGURAÇÕES DO ENDEREÇO =====
  
  tipo: {
    type: DataTypes.ENUM('cobranca', 'entrega'),
    allowNull: false,
    defaultValue: 'entrega',
    comment: 'Tipo do endereço: cobrança ou entrega'
  },

  principal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se é o endereço principal do usuário'
  },

  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Se o endereço está ativo'
  },

  // ===== INFORMAÇÕES ADICIONAIS =====
  
  nomeEndereco: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome personalizado: "Casa", "Trabalho", etc.'
  },

  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais sobre o endereço'
  },

  // ===== DADOS DE LOCALIZAÇÃO =====
  
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    },
    comment: 'Latitude para geolocalização'
  },

  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    },
    comment: 'Longitude para geolocalização'
  }

}, {
  // ===== CONFIGURAÇÕES DO MODELO =====
  
  tableName: 'addresses',
  timestamps: true,
  
  // ===== HOOKS =====
  
  hooks: {
    // Antes de salvar, formatar CEP
    beforeSave: (address) => {
      // Remover caracteres não numéricos do CEP
      if (address.cep) {
        address.cep = address.cep.replace(/\D/g, '');
      }
      
      // Converter UF para maiúsculas
      if (address.uf) {
        address.uf = address.uf.toUpperCase();
      }
      
      // Se este endereço for marcado como principal,
      // desmarcar outros endereços do mesmo usuário
      if (address.principal && address.userId) {
        // Esta lógica será implementada no controller
      }
    },
    
    // Após salvar, validar se há pelo menos um endereço principal
    afterSave: async (address) => {
      if (address.principal && address.userId) {
        // Verificar se há outros endereços principais
        const outrosPrincipais = await Address.findAll({
          where: {
            userId: address.userId,
            principal: true,
            id: { [connection.Sequelize.Op.ne]: address.id }
          }
        });
        
        // Se houver outros principais, desmarcar
        if (outrosPrincipais.length > 0) {
          await Address.update(
            { principal: false },
            {
              where: {
                id: { [connection.Sequelize.Op.in]: outrosPrincipais.map(a => a.id) }
              }
            }
          );
        }
      }
    }
  },

  // ===== ÍNDICES =====
  
  indexes: [
    {
      fields: ['userId'],         // Busca por usuário
      type: 'BTREE'
    },
    {
      fields: ['cep'],            // Busca por CEP
      type: 'BTREE'
    },
    {
      fields: ['cidade'],         // Busca por cidade
      type: 'BTREE'
    },
    {
      fields: ['uf'],             // Busca por estado
      type: 'BTREE'
    },
    {
      fields: ['tipo'],           // Busca por tipo
      type: 'BTREE'
    },
    {
      fields: ['principal'],      // Busca por endereços principais
      type: 'BTREE'
    },
    {
      fields: ['ativo'],          // Busca por endereços ativos
      type: 'BTREE'
    },
    // Índice composto para busca eficiente
    {
      fields: ['userId', 'tipo'],
      type: 'BTREE'
    }
  ]
});

export default Address;


