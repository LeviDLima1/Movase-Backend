/**
 * CART MODEL - Modelo do Carrinho de Compras
 * 
 * Gerencia o carrinho de compras dos usuários com itens,
 * quantidades, preços e status
 */

import { DataTypes } from 'sequelize';
import connection from '../database/connection.js';

const Cart = connection.define('Cart', {
  // ===== IDENTIFICAÇÃO =====
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID único do carrinho'
  },

  // ===== RELACIONAMENTOS =====
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do usuário dono do carrinho'
  },

  // ===== ITENS DO CARRINHO =====
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Array de itens no carrinho'
  },

  // ===== CÁLCULOS =====
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Subtotal dos itens (sem frete)'
  },

  frete: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do frete'
  },

  desconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do desconto aplicado'
  },

  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total final (subtotal + frete - desconto)'
  },

  // ===== CUPOM =====
  cupomCodigo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código do cupom aplicado'
  },

  cupomDesconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor do desconto do cupom'
  },

  // ===== ENDEREÇO DE ENTREGA =====
  enderecoEntrega: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Endereço de entrega selecionado'
  },

  // ===== FRETE =====
  freteSelecionado: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Opção de frete selecionada'
  },

  // ===== STATUS =====
  status: {
    type: DataTypes.ENUM('ativo', 'abandonado', 'convertido', 'expirado'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status do carrinho'
  },

  // ===== METADADOS =====
  ultimaAtualizacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Última atualização do carrinho'
  },

  expiraEm: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração do carrinho (30 dias)'
  },

  // ===== TIMESTAMPS =====
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de criação'
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de atualização'
  }
}, {
  tableName: 'carts',
  timestamps: true,
  underscored: true,
  comment: 'Tabela de carrinhos de compras'
});

// ===== HOOKS =====

// Antes de salvar, calcular totais
Cart.beforeSave(async (cart) => {
  // Calcular subtotal dos itens
  if (cart.items && Array.isArray(cart.items)) {
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  }

  // Calcular total final
  cart.total = cart.subtotal + cart.frete - cart.desconto;

  // Definir data de expiração (30 dias)
  if (!cart.expiraEm) {
    cart.expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Atualizar timestamp
  cart.ultimaAtualizacao = new Date();
});

// ===== MÉTODOS DE INSTÂNCIA =====

// Adicionar item ao carrinho
Cart.prototype.adicionarItem = async function(livroId, quantidade = 1) {
  const livro = await connection.models.Books.findByPk(livroId);
  if (!livro) {
    throw new Error('Livro não encontrado');
  }

  if (livro.estoque < quantidade) {
    throw new Error('Estoque insuficiente');
  }

  const item = {
    livroId: livro.id,
    titulo: livro.titulo,
    autor: livro.autor,
    preco: livro.preco,
    quantidade: quantidade,
    imagem: livro.imagemFront
  };

  // Verificar se item já existe
  const itemExistente = this.items.find(i => i.livroId === livroId);
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    this.items.push(item);
  }

  await this.save();
  return this;
};

// Remover item do carrinho
Cart.prototype.removerItem = async function(livroId) {
  this.items = this.items.filter(item => item.livroId !== livroId);
  await this.save();
  return this;
};

// Atualizar quantidade
Cart.prototype.atualizarQuantidade = async function(livroId, quantidade) {
  const item = this.items.find(i => i.livroId === livroId);
  if (item) {
    item.quantidade = quantidade;
    await this.save();
  }
  return this;
};

// Limpar carrinho
Cart.prototype.limpar = async function() {
  this.items = [];
  this.subtotal = 0;
  this.frete = 0;
  this.desconto = 0;
  this.total = 0;
  this.cupomCodigo = null;
  this.cupomDesconto = null;
  await this.save();
  return this;
};

// Aplicar cupom
Cart.prototype.aplicarCupom = async function(codigo) {
  // Aqui você implementaria a lógica de validação do cupom
  // Por enquanto, vamos simular um desconto de 10%
  this.cupomCodigo = codigo;
  this.cupomDesconto = this.subtotal * 0.1;
  this.desconto = this.cupomDesconto;
  await this.save();
  return this;
};

// Converter em pedido
Cart.prototype.converterEmPedido = async function() {
  this.status = 'convertido';
  await this.save();
  return this;
};

// ===== MÉTODOS ESTÁTICOS =====

// Buscar carrinho ativo do usuário
Cart.buscarCarrinhoAtivo = async function(userId) {
  return await Cart.findOne({
    where: {
      userId: userId,
      status: 'ativo'
    }
  });
};

// Criar novo carrinho
Cart.criarCarrinho = async function(userId) {
  return await Cart.create({
    userId: userId,
    items: [],
    status: 'ativo'
  });
};

// Limpar carrinhos expirados
Cart.limparExpirados = async function() {
  const agora = new Date();
  return await Cart.update(
    { status: 'expirado' },
    {
      where: {
        status: 'ativo',
        expiraEm: {
          [connection.Sequelize.Op.lt]: agora
        }
      }
    }
  );
};

// ===== RELACIONAMENTOS =====

Cart.associate = (models) => {
  // Carrinho pertence a um usuário
  Cart.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// ===== ÍNDICES =====

// Índices para performance
Cart.addIndex = () => {
  connection.addIndex('carts', ['user_id'], {
    name: 'idx_carts_user_id'
  });

  connection.addIndex('carts', ['status'], {
    name: 'idx_carts_status'
  });

  connection.addIndex('carts', ['expira_em'], {
    name: 'idx_carts_expira_em'
  });
};

export default Cart;
