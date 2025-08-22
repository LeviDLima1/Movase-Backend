import { DataTypes } from "sequelize";
import connection from "../database/connection.js";

/**
 * MODELO BOOKS (Livros)
 * 
 * Este modelo representa os livros da livraria.
 * Vamos definir todos os campos necessários para um sistema completo.
 */

const Books = connection.define('Books', {
  // ===== CAMPOS BÁSICOS DE IDENTIFICAÇÃO =====
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,           // Chave primária
    autoIncrement: true,        // Auto incremento
    allowNull: false
  },

  // ===== INFORMAÇÕES PRINCIPAIS DO LIVRO =====
  
  titulo: {
    type: DataTypes.STRING(255),  // VARCHAR(255) - título do livro
    allowNull: false,             // Campo obrigatório
    validate: {
      notEmpty: true,             // Não pode ser string vazia
      len: [1, 255]               // Mínimo 1, máximo 255 caracteres
    }
  },

  autor: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },

  descricao: {
    type: DataTypes.TEXT,         // TEXT - para descrições longas
    allowNull: true,              // Campo opcional
    comment: 'Descrição detalhada do livro'
  },

  sinopse: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Sinopse resumida do livro'
  },

  // ===== INFORMAÇÕES TÉCNICAS =====
  
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,                 // ISBN deve ser único
    validate: {
      len: [10, 20]               // ISBN tem entre 10-20 caracteres
    },
    comment: 'Código ISBN do livro'
  },

  paginas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,                     // Mínimo 1 página
      max: 10000                  // Máximo 10.000 páginas
    }
  },

  ano: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,                  // Ano mínimo 1900
      max: new Date().getFullYear() + 1  // Ano máximo = próximo ano
    }
  },

  editora: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  idioma: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Português'
  },

  formato: {
    type: DataTypes.ENUM('Físico', 'Digital', 'Ambos'),  // ENUM - valores fixos
    allowNull: true,
    defaultValue: 'Físico'
  },

  // ===== DIMENSÕES E PESO =====
  
  peso: {
    type: DataTypes.DECIMAL(5, 2),  // DECIMAL(5,2) - ex: 0.50 kg
    allowNull: true,
    validate: {
      min: 0.01,                    // Mínimo 0.01 kg
      max: 50.00                    // Máximo 50 kg
    },
    comment: 'Peso em quilogramas'
  },

  dimensoes: {
    type: DataTypes.STRING(50),     // ex: "16x23cm"
    allowNull: true
  },

  // ===== CATEGORIZAÇÃO =====
  
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoria principal: Ficção, Não-ficção, etc.'
  },

  subcategoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Subcategoria: Romance, Suspense, etc.'
  },

  tags: {
    type: DataTypes.JSON,           // JSON - array de tags
    allowNull: true,
    defaultValue: [],
    comment: 'Array de tags para busca: ["fé", "medo", "cristianismo"]'
  },

  // ===== PREÇOS E ESTOQUE =====
  
  preco: {
    type: DataTypes.DECIMAL(10, 2),  // DECIMAL(10,2) - ex: 89.90
    allowNull: false,
    validate: {
      min: 0.01,                     // Preço mínimo R$ 0,01
      max: 999999.99                 // Preço máximo R$ 999.999,99
    }
  },

  precoOriginal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Preço original antes de promoção'
  },

  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0                         // Estoque não pode ser negativo
    }
  },

  // ===== STATUS E FLAGS =====
  
  status: {
    type: DataTypes.ENUM('ativo', 'inativo'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status do produto na loja'
  },

  destaque: {
    type: DataTypes.BOOLEAN,         // BOOLEAN - true/false
    allowNull: false,
    defaultValue: false,
    comment: 'Se o livro está em destaque na página inicial'
  },

  novidade: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se é um lançamento recente'
  },

  promocao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se está em promoção'
  },

  // ===== IMAGENS =====
  
  imagemFront: {
    type: DataTypes.STRING(500),     // URL da imagem da capa frontal
    allowNull: true,
    validate: {
      isUrl: true                    // Deve ser uma URL válida
    }
  },

  imagemBack: {
    type: DataTypes.STRING(500),     // URL da imagem da capa traseira
    allowNull: true,
    validate: {
      isUrl: true
    }
  },

  // ===== MÉTRICAS E AVALIAÇÕES =====
  
  avaliacoes: {
    type: DataTypes.DECIMAL(2, 1),   // DECIMAL(2,1) - ex: 4.5
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5                         // Avaliação de 0 a 5
    },
    comment: 'Média das avaliações dos clientes'
  },

  totalAvaliacoes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número total de avaliações'
  },

  vendas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número total de vendas'
  },

  visualizacoes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número de visualizações da página'
  }

}, {
  // ===== CONFIGURAÇÕES DO MODELO =====
  
  tableName: 'books',              // Nome da tabela no banco
  timestamps: true,                // Adiciona createdAt e updatedAt automaticamente
  
  // ===== HOOKS (Gatilhos) =====
  
  hooks: {
    // Antes de salvar, validar se precoOriginal não é menor que preco
    beforeSave: (book) => {
      if (book.precoOriginal && book.precoOriginal < book.preco) {
        throw new Error('Preço original não pode ser menor que o preço atual');
      }
    },
    
    // Após salvar, atualizar métricas se necessário
    afterSave: (book) => {
      // Aqui você pode adicionar lógica adicional
      // como enviar notificações, atualizar cache, etc.
    }
  },

  // ===== ÍNDICES PARA PERFORMANCE =====
  
  indexes: [
    {
      fields: ['titulo'],           // Índice para busca por título
      type: 'BTREE'
    },
    {
      fields: ['autor'],            // Índice para busca por autor
      type: 'BTREE'
    },
    {
      fields: ['categoria'],        // Índice para filtros por categoria
      type: 'BTREE'
    },
    {
      fields: ['status'],           // Índice para filtros por status
      type: 'BTREE'
    },
    {
      fields: ['destaque'],         // Índice para livros em destaque
      type: 'BTREE'
    },
    {
      fields: ['preco'],            // Índice para ordenação por preço
      type: 'BTREE'
    }
  ]
});

export default Books;
