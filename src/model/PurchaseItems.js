import { DataTypes } from "sequelize";
import connection from "../database/connection.js";

/**
 * MODELO PURCHASE_ITEMS (Itens do Pedido)
 * 
 * Este modelo representa os itens individuais de cada pedido.
 * Um pedido pode ter múltiplos itens (livros).
 */

const PurchaseItems = connection.define('PurchaseItems', {
  // ===== CAMPOS BÁSICOS =====
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  // ===== RELACIONAMENTOS =====
  
  purchaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchases',
      key: 'id'
    },
    comment: 'ID do pedido ao qual este item pertence'
  },

  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    },
    comment: 'ID do livro comprado'
  },

  // ===== INFORMAÇÕES DO ITEM =====
  
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,                    // Mínimo 1 item
      max: 100                   // Máximo 100 itens
    },
    comment: 'Quantidade do item comprado'
  },

  precoUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01                  // Preço mínimo R$ 0,01
    },
    comment: 'Preço unitário no momento da compra (snapshot)'
  },

  precoTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Preço total do item (quantidade × preço unitário)'
  },

  desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Desconto aplicado neste item'
  },

  precoFinal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    },
    comment: 'Preço final após desconto'
  },

  // ===== SNAPSHOT DO PRODUTO =====
  
  dadosProduto: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados do produto no momento da compra (snapshot)'
  },

  // ===== STATUS DO ITEM =====
  
  status: {
    type: DataTypes.ENUM(
      'pendente',      // Item pendente
      'preparando',    // Item sendo preparado
      'enviado',       // Item enviado
      'entregue',      // Item entregue
      'cancelado',     // Item cancelado
      'devolvido'      // Item devolvido
    ),
    allowNull: false,
    defaultValue: 'pendente',
    comment: 'Status individual do item'
  },

  // ===== INFORMAÇÕES ADICIONAIS =====
  
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações específicas sobre este item'
  },

  // ===== DATAS =====
  
  dataEnvio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de envio deste item específico'
  },

  dataEntrega: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de entrega deste item específico'
  },

  // ===== AVALIAÇÃO =====
  
  avaliacao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Avaliação específica deste item (1-5)'
  },

  comentarioAvaliacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentário da avaliação deste item'
  }

}, {
  // ===== CONFIGURAÇÕES DO MODELO =====
  
  tableName: 'purchase_items',
  timestamps: true,
  
  // ===== HOOKS =====
  
  hooks: {
    // Antes de salvar, calcular preços
    beforeSave: (item) => {
      // Calcular preço total
      if (item.quantidade && item.precoUnitario) {
        item.precoTotal = item.quantidade * item.precoUnitario;
      }
      
      // Calcular preço final
      if (item.precoTotal !== undefined && item.desconto !== undefined) {
        item.precoFinal = item.precoTotal - item.desconto;
      }
      
      // Validar se preço final não é negativo
      if (item.precoFinal < 0) {
        throw new Error('Preço final do item não pode ser negativo');
      }
    },
    
    // Após salvar, atualizar estoque do livro
    afterCreate: async (item) => {
      // Importar modelo Books
      const Books = connection.models.Books;
      
      // Decrementar estoque
      await Books.decrement('estoque', {
        by: item.quantidade,
        where: { id: item.bookId }
      });
      
      // Incrementar vendas
      await Books.increment('vendas', {
        by: item.quantidade,
        where: { id: item.bookId }
      });
    },
    
    // Após atualizar, verificar mudanças de status
    afterUpdate: async (item) => {
      // Se o status mudou para 'enviado', registrar data
      if (item.status === 'enviado' && !item.dataEnvio) {
        await item.update({ dataEnvio: new Date() });
      }
      
      // Se o status mudou para 'entregue', registrar data
      if (item.status === 'entregue' && !item.dataEntrega) {
        await item.update({ dataEntrega: new Date() });
      }
    }
  },

  // ===== ÍNDICES =====
  
  indexes: [
    {
      fields: ['purchaseId'],    // Busca por pedido
      type: 'BTREE'
    },
    {
      fields: ['bookId'],        // Busca por livro
      type: 'BTREE'
    },
    {
      fields: ['status'],        // Busca por status
      type: 'BTREE'
    },
    {
      fields: ['dataEnvio'],     // Busca por data de envio
      type: 'BTREE'
    },
    {
      fields: ['dataEntrega'],   // Busca por data de entrega
      type: 'BTREE'
    },
    // Índices compostos
    {
      fields: ['purchaseId', 'bookId'],
      type: 'BTREE'
    },
    {
      fields: ['purchaseId', 'status'],
      type: 'BTREE'
    }
  ]
});

export default PurchaseItems;
