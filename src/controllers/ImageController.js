import BaseController from './BaseController.js';
import Image from '../model/Image.js';
import ResponseHandler from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import ImageOptimizationService from '../services/imageOptimizationService.js';

class ImageController extends BaseController {
  constructor() {
    super(Image);
  }

  // Upload de imagem
  upload = asyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return ResponseHandler.badRequest(res, 'Nenhum arquivo enviado');
      }

      const { originalname, mimetype, size, buffer } = req.file;
      const { entityType, entityId, imageType, alt, description, tags, optimize = 'true' } = req.body;

      // Validar tipo MIME
      if (!mimetype.startsWith('image/')) {
        return ResponseHandler.badRequest(res, 'Arquivo deve ser uma imagem');
      }

      // Validar tamanho (máximo 5MB)
      if (size > 5 * 1024 * 1024) {
        return ResponseHandler.badRequest(res, 'Imagem muito grande (máximo 5MB)');
      }

      // Validar imagem usando Sharp
      const validation = await ImageOptimizationService.validateImage(buffer);
      if (!validation.isValid) {
        return ResponseHandler.badRequest(res, `Imagem inválida: ${validation.error}`);
      }

      let processedImage = buffer;
      let processedSize = size;
      let processedMimeType = mimetype;

      // Otimizar imagem se solicitado
      if (optimize === 'true') {
        try {
          const optimizationResult = await ImageOptimizationService.optimizeImage(buffer, {
            quality: 80,
            maxWidth: 1200,
            maxHeight: 1200,
            format: 'jpeg'
          });
          
          processedImage = optimizationResult.buffer;
          processedSize = optimizationResult.size;
          processedMimeType = `image/${optimizationResult.format}`;
          
          console.log(`✅ Imagem otimizada: ${size} -> ${processedSize} bytes (${((size - processedSize) / size * 100).toFixed(1)}% redução)`);
        } catch (error) {
          console.error('⚠️ Erro na otimização, usando imagem original:', error.message);
        }
      }

      // Criar imagem no banco
      const image = await Image.create({
        originalName: originalname,
        mimeType: processedMimeType,
        size: processedSize,
        data: processedImage,
        entityType: entityType || 'general',
        entityId: entityId || null,
        imageType: imageType || 'gallery',
        alt: alt || originalname,
        description: description || '',
        tags: tags ? JSON.parse(tags) : [],
        uploadedBy: req.user?.id || null
      });

      return ResponseHandler.success(res, {
        message: 'Imagem enviada com sucesso',
        image: {
          id: image.id,
          url: image.getUrl(),
          thumbnailUrl: image.getThumbnailUrl(),
          originalName: image.originalName,
          size: image.size,
          mimeType: image.mimeType
        }
      });

    } catch (error) {
      console.error('Erro no upload de imagem:', error);
      return ResponseHandler.badRequest(res, 'Erro ao enviar imagem');
    }
  });

  // Download de imagem
  download = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { w, h, quality } = req.query;

      const image = await Image.findByPk(id);
      if (!image) {
        return ResponseHandler.notFound(res, 'Imagem não encontrada');
      }

      // Verificar se é pública
      if (!image.isPublic && (!req.user || req.user.id !== image.uploadedBy)) {
        return ResponseHandler.forbidden(res, 'Acesso negado');
      }

      // Configurar headers com fallback robusto para Content-Type
      let contentType = image.mimeType;
      
      // Se mimeType é null, vazio ou inválido, tentar detectar pelo nome do arquivo
      if (!contentType || contentType.trim() === '') {
        const fileName = image.originalName || image.filename || '';
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            contentType = 'image/jpeg';
            break;
          case 'png':
            contentType = 'image/png';
            break;
          case 'gif':
            contentType = 'image/gif';
            break;
          case 'webp':
            contentType = 'image/webp';
            break;
          case 'svg':
            contentType = 'image/svg+xml';
            break;
          default:
            contentType = 'image/png'; // Fallback padrão
        }
        
        // Content-Type detectado automaticamente
      }
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': image.size,
        'Cache-Control': 'public, max-age=31536000', // 1 ano
        'ETag': `"${image.id}-${image.updatedAt.getTime()}"`
      });

      // Se não há parâmetros de redimensionamento, retornar imagem original
      if (!w && !h) {
        return res.send(image.data);
      }

      // TODO: Implementar redimensionamento com sharp ou similar
      // Por enquanto, retorna a imagem original
      return res.send(image.data);

    } catch (error) {
      console.error('Erro no download de imagem:', error);
      return ResponseHandler.badRequest(res, 'Erro ao baixar imagem');
    }
  });

  // Thumbnail
  thumbnail = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { w = 150, h = 150 } = req.query;

      const image = await Image.findByPk(id);
      if (!image) {
        return ResponseHandler.notFound(res, 'Imagem não encontrada');
      }

      // Verificar se é pública
      if (!image.isPublic && (!req.user || req.user.id !== image.uploadedBy)) {
        return ResponseHandler.forbidden(res, 'Acesso negado');
      }

      // Gerar thumbnail usando Sharp
      try {
        const thumbnailResult = await ImageOptimizationService.generateThumbnail(image.data, {
          width: parseInt(w),
          height: parseInt(h),
          quality: 70,
          format: 'jpeg'
        });

        res.set({
          'Content-Type': `image/${thumbnailResult.format}`,
          'Content-Length': thumbnailResult.size,
          'Cache-Control': 'public, max-age=31536000',
          'X-Original-Size': image.size,
          'X-Thumbnail-Size': thumbnailResult.size
        });

        return res.send(thumbnailResult.buffer);
      } catch (error) {
        console.error('Erro na geração de thumbnail:', error);
        
        // Fallback: retornar imagem original redimensionada
        res.set({
          'Content-Type': image.mimeType || 'image/jpeg',
          'Content-Length': image.size,
          'Cache-Control': 'public, max-age=31536000'
        });

        return res.send(image.data);
      }

    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      return ResponseHandler.badRequest(res, 'Erro ao gerar thumbnail');
    }
  });

  // Buscar imagens por entidade
  findByEntity = asyncHandler(async (req, res) => {
    try {
      const { entityType, entityId, imageType } = req.params;

      const images = await Image.findByEntity(entityType, entityId, imageType);

      return ResponseHandler.success(res, {
        message: 'Imagens encontradas',
        images: images.map(img => ({
          id: img.id,
          url: img.getUrl(),
          thumbnailUrl: img.getThumbnailUrl(),
          originalName: img.originalName,
          imageType: img.imageType,
          order: img.order,
          alt: img.alt,
          description: img.description
        }))
      });

    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      return ResponseHandler.badRequest(res, 'Erro ao buscar imagens');
    }
  });

  // Buscar imagens de um livro
  findBookImages = asyncHandler(async (req, res) => {
    try {
      const { bookId } = req.params;

      const images = await Image.findBookImages(bookId);

      return ResponseHandler.success(res, {
        message: 'Imagens do livro encontradas',
        images: images.map(img => ({
          id: img.id,
          url: img.getUrl(),
          thumbnailUrl: img.getThumbnailUrl(),
          imageType: img.imageType,
          order: img.order,
          alt: img.alt
        }))
      });

    } catch (error) {
      console.error('Erro ao buscar imagens do livro:', error);
      return ResponseHandler.badRequest(res, 'Erro ao buscar imagens do livro');
    }
  });

  // Atualizar ordem das imagens
  updateOrder = asyncHandler(async (req, res) => {
    try {
      const { images } = req.body; // Array de {id, order}

      if (!Array.isArray(images)) {
        return ResponseHandler.badRequest(res, 'Dados inválidos');
      }

      // Atualizar ordem de cada imagem
      for (const { id, order } of images) {
        await Image.update({ order }, { where: { id } });
      }

      return ResponseHandler.success(res, {
        message: 'Ordem das imagens atualizada'
      });

    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      return ResponseHandler.badRequest(res, 'Erro ao atualizar ordem');
    }
  });

  // Deletar imagem
  delete = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const image = await Image.findByPk(id);
      if (!image) {
        return ResponseHandler.notFound(res, 'Imagem não encontrada');
      }

      // Verificar permissão
      if (req.user && req.user.id !== image.uploadedBy) {
        return ResponseHandler.forbidden(res, 'Sem permissão para deletar esta imagem');
      }

      await image.destroy();

      return ResponseHandler.success(res, {
        message: 'Imagem deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return ResponseHandler.badRequest(res, 'Erro ao deletar imagem');
    }
  });
}

export default new ImageController();
