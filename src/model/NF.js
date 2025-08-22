/**
 * NF MODEL - Modelo da Nota Fiscal
 * 
 * Gerencia as notas fiscais eletrônicas (NF-e) dos pedidos
 * com dados fiscais, impostos e documentos
 */

import { DataTypes } from 'sequelize';
import connection from '../database/connection.js';

const NF = connection.define('NF', {
  // ===== IDENTIFICAÇÃO =====
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID único da nota fiscal'
  },

  // ===== RELACIONAMENTOS =====
  purchaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchases',
      key: 'id'
    },
    comment: 'ID do pedido relacionado'
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do usuário/cliente'
  },

  // ===== DADOS FISCAIS =====
  numeroNF: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Número da nota fiscal'
  },

  serieNF: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '1',
    comment: 'Série da nota fiscal'
  },

  chaveAcesso: {
    type: DataTypes.STRING(44),
    allowNull: true,
    unique: true,
    comment: 'Chave de acesso da NF-e'
  },

  protocoloAutorizacao: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Protocolo de autorização da SEFAZ'
  },

  // ===== DADOS DO EMITENTE =====
  emitenteCNPJ: {
    type: DataTypes.STRING(18),
    allowNull: false,
    comment: 'CNPJ da empresa emitente'
  },

  emitenteRazaoSocial: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Razão social da empresa emitente'
  },

  emitenteNomeFantasia: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nome fantasia da empresa emitente'
  },

  emitenteEndereco: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Endereço completo do emitente'
  },

  emitenteTelefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone do emitente'
  },

  emitenteEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email do emitente'
  },

  // ===== DADOS DO DESTINATÁRIO =====
  destinatarioCPF: {
    type: DataTypes.STRING(14),
    allowNull: false,
    comment: 'CPF do destinatário'
  },

  destinatarioNome: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nome completo do destinatário'
  },

  destinatarioEndereco: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Endereço completo do destinatário'
  },

  destinatarioTelefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone do destinatário'
  },

  destinatarioEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email do destinatário'
  },

  // ===== DADOS FISCAIS =====
  baseCalculoICMS: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Base de cálculo do ICMS'
  },

  valorICMS: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do ICMS'
  },

  baseCalculoIPI: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Base de cálculo do IPI'
  },

  valorIPI: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do IPI'
  },

  valorPIS: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do PIS'
  },

  valorCOFINS: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do COFINS'
  },

  valorTotalImpostos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor total dos impostos'
  },

  // ===== VALORES =====
  valorMercadorias: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor total das mercadorias'
  },

  valorFrete: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do frete'
  },

  valorSeguro: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do seguro'
  },

  valorDesconto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor do desconto'
  },

  valorTotalNF: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Valor total da nota fiscal'
  },

  // ===== ITENS =====
  itens: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Array com os itens da nota fiscal'
  },

  // ===== STATUS =====
  status: {
    type: DataTypes.ENUM('pendente', 'autorizada', 'cancelada', 'denegada'),
    allowNull: false,
    defaultValue: 'pendente',
    comment: 'Status da nota fiscal'
  },

  // ===== DATAS =====
  dataEmissao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de emissão da NF'
  },

  dataAutorizacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de autorização da SEFAZ'
  },

  dataCancelamento: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de cancelamento (se aplicável)'
  },

  // ===== MOTIVOS =====
  motivoCancelamento: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento'
  },

  // ===== ARQUIVOS =====
  xmlNF: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'XML da nota fiscal'
  },

  pdfNF: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL do PDF da nota fiscal'
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
  tableName: 'nfs',
  timestamps: true,
  underscored: true,
  comment: 'Tabela de notas fiscais eletrônicas'
});

// ===== HOOKS =====

// Antes de salvar, calcular valores
NF.beforeSave(async (nf) => {
  // Calcular valor total dos impostos
  nf.valorTotalImpostos = nf.valorICMS + nf.valorIPI + nf.valorPIS + nf.valorCOFINS;

  // Calcular valor total da NF
  nf.valorTotalNF = nf.valorMercadorias + nf.valorFrete + nf.valorSeguro - nf.valorDesconto + nf.valorTotalImpostos;

  // Gerar número da NF se não existir
  if (!nf.numeroNF) {
    const ultimaNF = await NF.findOne({
      order: [['numero_nf', 'DESC']]
    });
    const proximoNumero = ultimaNF ? parseInt(ultimaNF.numeroNF) + 1 : 1;
    nf.numeroNF = proximoNumero.toString().padStart(8, '0');
  }

  // Definir data de emissão
  if (!nf.dataEmissao) {
    nf.dataEmissao = new Date();
  }
});

// ===== MÉTODOS DE INSTÂNCIA =====

// Autorizar NF
NF.prototype.autorizar = async function(protocolo, chaveAcesso) {
  this.status = 'autorizada';
  this.protocoloAutorizacao = protocolo;
  this.chaveAcesso = chaveAcesso;
  this.dataAutorizacao = new Date();
  await this.save();
  return this;
};

// Cancelar NF
NF.prototype.cancelar = async function(motivo) {
  this.status = 'cancelada';
  this.motivoCancelamento = motivo;
  this.dataCancelamento = new Date();
  await this.save();
  return this;
};

// Gerar XML
NF.prototype.gerarXML = async function() {
  // Aqui você implementaria a geração do XML da NF-e
  // Por enquanto, vamos criar um XML básico
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${this.chaveAcesso}">
      <ide>
        <nNF>${this.numeroNF}</nNF>
        <serie>${this.serieNF}</serie>
        <dhEmi>${this.dataEmissao.toISOString()}</dhEmi>
      </ide>
      <emit>
        <CNPJ>${this.emitenteCNPJ}</CNPJ>
        <xNome>${this.emitenteRazaoSocial}</xNome>
      </emit>
      <dest>
        <CPF>${this.destinatarioCPF}</CPF>
        <xNome>${this.destinatarioNome}</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vBC>${this.baseCalculoICMS}</vBC>
          <vICMS>${this.valorICMS}</vICMS>
          <vNF>${this.valorTotalNF}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>1.0</verAplic>
      <chNFe>${this.chaveAcesso}</chNFe>
      <dhRecbto>${this.dataAutorizacao?.toISOString()}</dhRecbto>
      <nProt>${this.protocoloAutorizacao}</nProt>
      <digVal>${this.chaveAcesso}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  this.xmlNF = xml;
  await this.save();
  return xml;
};

// ===== MÉTODOS ESTÁTICOS =====

// Buscar NF por número
NF.buscarPorNumero = async function(numero) {
  return await NF.findOne({
    where: { numeroNF: numero }
  });
};

// Buscar NFs do usuário
NF.buscarPorUsuario = async function(userId) {
  return await NF.findAll({
    where: { userId: userId },
    order: [['created_at', 'DESC']]
  });
};

// Buscar NFs do pedido
NF.buscarPorPedido = async function(purchaseId) {
  return await NF.findAll({
    where: { purchaseId: purchaseId }
  });
};

// Gerar próxima chave de acesso
NF.gerarChaveAcesso = async function() {
  // Aqui você implementaria a geração da chave de acesso
  // Por enquanto, vamos gerar uma chave simulada
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`.substring(0, 44);
};

// ===== RELACIONAMENTOS =====

NF.associate = (models) => {
  // NF pertence a um pedido
  NF.belongsTo(models.Purchases, {
    foreignKey: 'purchaseId',
    as: 'purchase'
  });

  // NF pertence a um usuário
  NF.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// ===== ÍNDICES =====

// Índices para performance
NF.addIndex = () => {
  connection.addIndex('nfs', ['numero_nf'], {
    name: 'idx_nfs_numero_nf',
    unique: true
  });

  connection.addIndex('nfs', ['chave_acesso'], {
    name: 'idx_nfs_chave_acesso',
    unique: true
  });

  connection.addIndex('nfs', ['purchase_id'], {
    name: 'idx_nfs_purchase_id'
  });

  connection.addIndex('nfs', ['user_id'], {
    name: 'idx_nfs_user_id'
  });

  connection.addIndex('nfs', ['status'], {
    name: 'idx_nfs_status'
  });

  connection.addIndex('nfs', ['data_emissao'], {
    name: 'idx_nfs_data_emissao'
  });
};

export default NF;
