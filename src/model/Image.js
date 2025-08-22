import { DataTypes } from 'sequelize';
import connection from '../database/connection.js';

const Image = connection.define('Image', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true, 
    allowNull: false, 
    comment: 'ID único da imagem' 
  },
  filename: { 
    type: DataTypes.STRING(255), 
    allowNull: false, 
    comment: 'Nome original do arquivo' 
  },
  originalName: { 
    type: DataTypes.STRING(255), 
    allowNull: false, 
    comment: 'Nome original do arquivo' 
  },
  mimeType: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    comment: 'Tipo MIME da imagem (image/jpeg, image/png, etc.)' 
  },
  size: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    comment: 'Tamanho do arquivo em bytes' 
  },
  data: { 
    type: DataTypes.BLOB('long'), 
    allowNull: false, 
    comment: 'Dados binários da imagem' 
  },
  width: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    comment: 'Largura da imagem em pixels' 
  },
  height: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    comment: 'Altura da imagem em pixels' 
  },
  alt: { 
    type: DataTypes.STRING(255), 
    allowNull: true, 
    comment: 'Texto alternativo para acessibilidade' 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true, 
    comment: 'Descrição da imagem' 
  },
  tags: { 
    type: DataTypes.JSONB, 
    allowNull: true, 
    defaultValue: [], 
    comment: 'Tags associadas à imagem' 
  },
  isPublic: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: true, 
    comment: 'Se a imagem é pública' 
  },
  uploadedBy: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    references: { model: 'users', key: 'id' }, 
    comment: 'ID do usuário que fez upload' 
  },
  entityType: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    comment: 'Tipo de entidade (book, user, category, etc.)' 
  },
  entityId: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    comment: 'ID da entidade relacionada' 
  },
  imageType: { 
    type: DataTypes.ENUM('front', 'back', 'gallery', 'thumbnail', 'banner', 'icon'), 
    allowNull: false, 
    defaultValue: 'gallery', 
    comment: 'Tipo da imagem' 
  },
  order: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0, 
    comment: 'Ordem de exibição' 
  },
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
  tableName: 'images', 
  timestamps: true, 
  underscored: true, 
  comment: 'Tabela de imagens armazenadas no banco de dados' 
});

// Hooks
Image.beforeSave(async (image) => {
  // Gerar filename único se não fornecido
  if (!image.filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    image.filename = `${timestamp}_${random}`;
  }
  
  // Atualizar updatedAt
  image.updatedAt = new Date();
});

// Métodos de instância
Image.prototype.getUrl = function() {
  return `/api/images/${this.id}`;
};

Image.prototype.getThumbnailUrl = function() {
  return `/api/images/${this.id}/thumbnail`;
};

Image.prototype.getResizedUrl = function(width, height) {
  return `/api/images/${this.id}/resize?w=${width}&h=${height}`;
};

Image.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return {
    ...values,
    url: this.getUrl(),
    thumbnailUrl: this.getThumbnailUrl()
  };
};

// Métodos estáticos
Image.findByEntity = async function(entityType, entityId, imageType = null) {
  const where = { entityType, entityId };
  if (imageType) where.imageType = imageType;
  
  return await this.findAll({
    where,
    order: [['order', 'ASC'], ['createdAt', 'DESC']]
  });
};

Image.findBookImages = async function(bookId) {
  return await this.findByEntity('book', bookId);
};

Image.findUserAvatar = async function(userId) {
  const images = await this.findByEntity('user', userId, 'thumbnail');
  return images.length > 0 ? images[0] : null;
};

export default Image;
