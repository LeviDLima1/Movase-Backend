/**
 * CARDS SAVED MODEL - Modelo dos Cartões Salvos
 * 
 * Gerencia os cartões de crédito/débito salvos pelos usuários
 * com dados criptografados e validações de segurança
 */

import { DataTypes } from 'sequelize';
import connection from '../database/connection.js';
import bcrypt from 'bcrypt';

const CardsSaved = connection.define('CardsSaved', {
  // ===== IDENTIFICAÇÃO =====
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID único do cartão salvo'
  },

  // ===== RELACIONAMENTOS =====
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do usuário dono do cartão'
  },

  // ===== DADOS DO CARTÃO =====
  nomeCartao: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nome como está no cartão'
  },

  numeroCartao: {
    type: DataTypes.STRING(255), // Criptografado
    allowNull: false,
    comment: 'Número do cartão (criptografado)'
  },

  numeroCartaoHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash dos últimos 4 dígitos para identificação'
  },

  bandeira: {
    type: DataTypes.ENUM('visa', 'mastercard', 'elo', 'american_express', 'hipercard', 'discover'),
    allowNull: false,
    comment: 'Bandeira do cartão'
  },

  tipo: {
    type: DataTypes.ENUM('credito', 'debito', 'credito_debito'),
    allowNull: false,
    comment: 'Tipo do cartão'
  },

  mesVencimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    },
    comment: 'Mês de vencimento (1-12)'
  },

  anoVencimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: new Date().getFullYear()
    },
    comment: 'Ano de vencimento'
  },

  cvv: {
    type: DataTypes.STRING(255), // Criptografado
    allowNull: false,
    comment: 'CVV do cartão (criptografado)'
  },

  // ===== DADOS ADICIONAIS =====
  titular: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nome do titular do cartão'
  },

  cpfTitular: {
    type: DataTypes.STRING(14),
    allowNull: true,
    comment: 'CPF do titular do cartão'
  },

  telefoneTitular: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone do titular'
  },

  // ===== CONFIGURAÇÕES =====
  padrao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se é o cartão padrão do usuário'
  },

  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Se o cartão está ativo'
  },

  // ===== DADOS DE PAGAMENTO =====
  tokenPagamento: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token do gateway de pagamento'
  },

  gatewayPagamento: {
    type: DataTypes.ENUM('pagseguro', 'stripe', 'paypal', 'mercadopago'),
    allowNull: true,
    comment: 'Gateway de pagamento utilizado'
  },

  // ===== VALIDAÇÕES =====
  validado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o cartão foi validado'
  },

  dataValidacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da validação do cartão'
  },

  ultimaTransacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última transação'
  },

  // ===== SEGURANÇA =====
  tentativasFalha: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número de tentativas de transação falhadas'
  },

  bloqueado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se o cartão está bloqueado por segurança'
  },

  motivoBloqueio: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Motivo do bloqueio do cartão'
  },

  // ===== METADADOS =====
  dispositivoCadastro: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Dispositivo usado para cadastrar o cartão'
  },

  ipCadastro: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP usado para cadastrar o cartão'
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
  tableName: 'cards_saved',
  timestamps: true,
  underscored: true,
  comment: 'Tabela de cartões salvos pelos usuários'
});

// ===== HOOKS =====

// Antes de salvar, criptografar dados sensíveis
CardsSaved.beforeSave(async (card) => {
  // Criptografar número do cartão se foi alterado
  if (card.changed('numeroCartao')) {
    const saltRounds = 12;
    card.numeroCartao = await bcrypt.hash(card.numeroCartao, saltRounds);
  }

  // Criptografar CVV se foi alterado
  if (card.changed('cvv')) {
    const saltRounds = 12;
    card.cvv = await bcrypt.hash(card.cvv, saltRounds);
  }

  // Gerar hash dos últimos 4 dígitos para identificação
  if (card.changed('numeroCartao')) {
    const numeroOriginal = card.numeroCartao; // Assumindo que ainda não foi criptografado
    const ultimos4 = numeroOriginal.slice(-4);
    card.numeroCartaoHash = await bcrypt.hash(ultimos4, 10);
  }

  // Se este cartão for definido como padrão, desmarcar outros
  if (card.padrao) {
    await CardsSaved.update(
      { padrao: false },
      {
        where: {
          userId: card.userId,
          id: { [connection.Sequelize.Op.ne]: card.id }
        }
      }
    );
  }

  // Validar vencimento
  const hoje = new Date();
  const vencimento = new Date(card.anoVencimento, card.mesVencimento - 1, 1);
  if (vencimento < hoje) {
    throw new Error('Cartão vencido');
  }
});

// ===== MÉTODOS DE INSTÂNCIA =====

// Validar cartão
CardsSaved.prototype.validar = async function() {
  this.validado = true;
  this.dataValidacao = new Date();
  await this.save();
  return this;
};

// Bloquear cartão
CardsSaved.prototype.bloquear = async function(motivo) {
  this.bloqueado = true;
  this.motivoBloqueio = motivo;
  this.ativo = false;
  await this.save();
  return this;
};

// Desbloquear cartão
CardsSaved.prototype.desbloquear = async function() {
  this.bloqueado = false;
  this.motivoBloqueio = null;
  this.tentativasFalha = 0;
  this.ativo = true;
  await this.save();
  return this;
};

// Registrar tentativa falhada
CardsSaved.prototype.registrarFalha = async function() {
  this.tentativasFalha += 1;
  this.ultimaTransacao = new Date();

  // Bloquear após 3 tentativas falhadas
  if (this.tentativasFalha >= 3) {
    await this.bloquear('Múltiplas tentativas falhadas');
  } else {
    await this.save();
  }

  return this;
};

// Registrar transação bem-sucedida
CardsSaved.prototype.registrarSucesso = async function() {
  this.tentativasFalha = 0;
  this.ultimaTransacao = new Date();
  await this.save();
  return this;
};

// Definir como padrão
CardsSaved.prototype.definirComoPadrao = async function() {
  // Desmarcar outros cartões do usuário
  await CardsSaved.update(
    { padrao: false },
    {
      where: {
        userId: this.userId,
        id: { [connection.Sequelize.Op.ne]: this.id }
      }
    }
  );

  // Marcar este como padrão
  this.padrao = true;
  await this.save();
  return this;
};

// Verificar se está vencido
CardsSaved.prototype.estaVencido = function() {
  const hoje = new Date();
  const vencimento = new Date(this.anoVencimento, this.mesVencimento - 1, 1);
  return vencimento < hoje;
};

// Verificar se está próximo do vencimento (30 dias)
CardsSaved.prototype.proximoVencimento = function() {
  const hoje = new Date();
  const vencimento = new Date(this.anoVencimento, this.mesVencimento - 1, 1);
  const diffTime = vencimento - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays > 0;
};

// ===== MÉTODOS ESTÁTICOS =====

// Buscar cartões do usuário
CardsSaved.buscarPorUsuario = async function(userId) {
  return await CardsSaved.findAll({
    where: {
      userId: userId,
      ativo: true
    },
    order: [
      ['padrao', 'DESC'],
      ['created_at', 'DESC']
    ]
  });
};

// Buscar cartão padrão do usuário
CardsSaved.buscarPadrao = async function(userId) {
  return await CardsSaved.findOne({
    where: {
      userId: userId,
      padrao: true,
      ativo: true,
      bloqueado: false
    }
  });
};

// Validar número do cartão (algoritmo de Luhn)
CardsSaved.validarNumero = function(numero) {
  const numeroLimpo = numero.replace(/\D/g, '');
  
  if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
    return false;
  }

  let soma = 0;
  let par = false;

  for (let i = numeroLimpo.length - 1; i >= 0; i--) {
    let digito = parseInt(numeroLimpo[i]);

    if (par) {
      digito *= 2;
      if (digito > 9) {
        digito -= 9;
      }
    }

    soma += digito;
    par = !par;
  }

  return soma % 10 === 0;
};

// Identificar bandeira pelo número
CardsSaved.identificarBandeira = function(numero) {
  const numeroLimpo = numero.replace(/\D/g, '');
  
  // Visa
  if (/^4/.test(numeroLimpo)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(numeroLimpo) || /^2[2-7]/.test(numeroLimpo)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(numeroLimpo)) {
    return 'american_express';
  }
  
  // Elo
  if (/^(636368|438935|504175|451416|636297)/.test(numeroLimpo)) {
    return 'elo';
  }
  
  // Hipercard
  if (/^(606282|3841)/.test(numeroLimpo)) {
    return 'hipercard';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(numeroLimpo)) {
    return 'discover';
  }
  
  return 'mastercard'; // Padrão
};

// Buscar cartões próximos do vencimento
CardsSaved.buscarProximosVencimento = async function() {
  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return await CardsSaved.findAll({
    where: {
      ativo: true,
      bloqueado: false
    }
  }).then(cartoes => {
    return cartoes.filter(cartao => cartao.proximoVencimento());
  });
};

// Buscar cartões vencidos
CardsSaved.buscarVencidos = async function() {
  return await CardsSaved.findAll({
    where: {
      ativo: true
    }
  }).then(cartoes => {
    return cartoes.filter(cartao => cartao.estaVencido());
  });
};

// ===== RELACIONAMENTOS =====

CardsSaved.associate = (models) => {
  // Cartão salvo pertence a um usuário
  CardsSaved.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// ===== ÍNDICES =====

// Índices para performance
CardsSaved.addIndex = () => {
  connection.addIndex('cards_saved', ['user_id'], {
    name: 'idx_cards_saved_user_id'
  });

  connection.addIndex('cards_saved', ['padrao'], {
    name: 'idx_cards_saved_padrao'
  });

  connection.addIndex('cards_saved', ['ativo'], {
    name: 'idx_cards_saved_ativo'
  });

  connection.addIndex('cards_saved', ['bloqueado'], {
    name: 'idx_cards_saved_bloqueado'
  });

  connection.addIndex('cards_saved', ['bandeira'], {
    name: 'idx_cards_saved_bandeira'
  });

  connection.addIndex('cards_saved', ['mes_vencimento', 'ano_vencimento'], {
    name: 'idx_cards_saved_vencimento'
  });
};

export default CardsSaved;
