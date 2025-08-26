import { DataTypes } from "sequelize";
import connection from "../database/connection.js";

/**
 * MODELO PURCHASES (Compras/Pedidos)
 * 
 * Este modelo representa os pedidos/compras dos usuários.
 * Cada pedido pode ter múltiplos itens (livros).
 */

const Purchases = connection.define('Purchases', {
  // ===== CAMPOS BÁSICOS =====
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // ===== RELACIONAMENTOS =====
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do usuário que fez o pedido'
  },

  addressId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'addresses',
      key: 'id'
    },
    comment: 'ID do endereço de entrega'
  },

  // ===== INFORMAÇÕES DO PEDIDO =====
  
  numero: {
    type: DataTypes.STRING(50),
    allowNull: true, // Temporariamente true para permitir que o hook preencha
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Número único do pedido (ex: PED-2024-001)'
  },

  // ===== STATUS DO PEDIDO =====
  
  status: {
    type: DataTypes.ENUM(
      'pendente',      // Pedido criado, aguardando pagamento
      'pago',          // Pagamento confirmado
      'preparando',    // Pedido sendo preparado
      'enviado',       // Pedido enviado
      'entregue',      // Pedido entregue
      'cancelado',     // Pedido cancelado
      'devolvido'      // Pedido devolvido
    ),
    allowNull: false,
    defaultValue: 'pendente',
    comment: 'Status atual do pedido'
  },

  // ===== VALORES E PAGAMENTO =====
  
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Soma dos valores dos itens (sem frete)'
  },

  frete: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Valor do frete'
  },

  desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Valor do desconto aplicado'
  },

  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Valor total do pedido (subtotal + frete - desconto)'
  },

  // ===== INFORMAÇÕES DE PAGAMENTO =====
  
  formaPagamento: {
    type: DataTypes.ENUM('pix', 'boleto', 'cartao'),
    allowNull: false,
    comment: 'Forma de pagamento escolhida'
  },

  parcelas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 12
    },
    comment: 'Número de parcelas'
  },

  dadosPagamento: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados do pagamento (cartão, PIX, etc.)'
  },

  // ===== INFORMAÇÕES DE ENTREGA =====
  
  enderecoEntrega: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados do endereço de entrega (snapshot)'
  },

  codigoRastreamento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Código de rastreamento dos Correios'
  },

  servicoFrete: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Serviço de frete escolhido (SEDEX, PAC, etc.)'
  },

  prazoEntrega: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Prazo de entrega em dias úteis'
  },

  // ===== DATAS IMPORTANTES =====
  
  dataPagamento: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora do pagamento'
  },

  dataEnvio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora do envio'
  },

  dataEntrega: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora da entrega'
  },

  dataCancelamento: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora do cancelamento'
  },

  // ===== INFORMAÇÕES ADICIONAIS =====
  
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações do cliente sobre o pedido'
  },

  observacoesInternas: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações internas da loja'
  },

  // ===== DADOS DO CLIENTE (SNAPSHOT) =====
  
  dadosCliente: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados do cliente no momento do pedido (snapshot)'
  },

  // ===== MÉTRICAS =====
  
  tempoProcessamento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tempo de processamento em minutos'
  },

  avaliacao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Avaliação do pedido pelo cliente (1-5)'
  },

  comentarioAvaliacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentário da avaliação'
  }

}, {
  // ===== CONFIGURAÇÕES DO MODELO =====
  
  tableName: 'purchases',
  timestamps: true,
  
  // ===== HOOKS =====
  
  hooks: {
    // Antes de salvar, gerar número do pedido se não existir
    beforeCreate: (purchase) => {
      console.log('🔧 Hook beforeCreate executado');
      console.log('📋 Purchase data:', purchase.dataValues);
      
      // Sempre gerar número se não existir ou estiver vazio
      if (!purchase.numero || purchase.numero.trim() === '') {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        const segundo = String(data.getSeconds()).padStart(2, '0');
        
        purchase.numero = `PED-${ano}${mes}${dia}-${hora}${minuto}${segundo}`;
        console.log('📋 Número gerado:', purchase.numero);
      }
    },
    
    // Antes de salvar, calcular total
    beforeSave: (purchase) => {
      // Calcular total se não foi fornecido
      if (purchase.subtotal !== undefined && purchase.frete !== undefined && purchase.desconto !== undefined) {
        purchase.total = purchase.subtotal + purchase.frete - purchase.desconto;
      }
      
      // Validar se total não é negativo
      if (purchase.total < 0) {
        throw new Error('Total do pedido não pode ser negativo');
      }
    },
    
    // Após salvar, atualizar métricas
    afterSave: async (purchase) => {
      // Se o status mudou para 'pago', registrar data de pagamento
      if (purchase.status === 'pago' && !purchase.dataPagamento) {
        await purchase.update({ dataPagamento: new Date() });
      }
      
      // Se o status mudou para 'enviado', registrar data de envio
      if (purchase.status === 'enviado' && !purchase.dataEnvio) {
        await purchase.update({ dataEnvio: new Date() });
      }
      
      // Se o status mudou para 'entregue', registrar data de entrega
      if (purchase.status === 'entregue' && !purchase.dataEntrega) {
        await purchase.update({ dataEntrega: new Date() });
      }
      
      // Se o status mudou para 'cancelado', registrar data de cancelamento
      if (purchase.status === 'cancelado' && !purchase.dataCancelamento) {
        await purchase.update({ dataCancelamento: new Date() });
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
      fields: ['numero'],         // Busca por número do pedido
      type: 'BTREE'
    },
    {
      fields: ['status'],         // Busca por status
      type: 'BTREE'
    },
    {
      fields: ['dataPagamento'],  // Busca por data de pagamento
      type: 'BTREE'
    },
    {
      fields: ['dataEnvio'],      // Busca por data de envio
      type: 'BTREE'
    },
    {
      fields: ['codigoRastreamento'], // Busca por código de rastreamento
      type: 'BTREE'
    },
    {
      fields: ['formaPagamento'], // Busca por forma de pagamento
      type: 'BTREE'
    },
    // Índices compostos para consultas complexas
    {
      fields: ['userId', 'status'],
      type: 'BTREE'
    },
    {
      fields: ['status', 'createdAt'],
      type: 'BTREE'
    }
  ]
});

export default Purchases;
