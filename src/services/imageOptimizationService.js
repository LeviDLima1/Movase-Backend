import sharp from 'sharp';
import ResponseHandler from '../utils/responseHandler.js';

/**
 * SERVIÇO DE OTIMIZAÇÃO DE IMAGENS
 * 
 * Este serviço utiliza Sharp para otimizar imagens,
 * gerar thumbnails e converter formatos.
 */

class ImageOptimizationService {
  
  /**
   * Otimizar imagem principal
   */
  static async optimizeImage(imageBuffer, options = {}) {
    try {
      const {
        quality = 80,
        maxWidth = 1200,
        maxHeight = 1200,
        format = 'jpeg'
      } = options;

      let pipeline = sharp(imageBuffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Aplicar otimização baseada no formato
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          pipeline = pipeline.jpeg({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality });
      }

      const optimizedBuffer = await pipeline.toBuffer();
      
      return {
        buffer: optimizedBuffer,
        size: optimizedBuffer.length,
        format: format.toLowerCase()
      };
    } catch (error) {
      console.error('Erro na otimização de imagem:', error);
      throw new Error('Falha na otimização da imagem');
    }
  }

  /**
   * Gerar thumbnail
   */
  static async generateThumbnail(imageBuffer, options = {}) {
    try {
      const {
        width = 300,
        height = 300,
        quality = 70,
        format = 'jpeg'
      } = options;

      let pipeline = sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        });

      // Aplicar formato
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          pipeline = pipeline.jpeg({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ quality });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality });
      }

      const thumbnailBuffer = await pipeline.toBuffer();
      
      return {
        buffer: thumbnailBuffer,
        size: thumbnailBuffer.length,
        format: format.toLowerCase()
      };
    } catch (error) {
      console.error('Erro na geração de thumbnail:', error);
      throw new Error('Falha na geração do thumbnail');
    }
  }

  /**
   * Gerar múltiplos tamanhos de thumbnail
   */
  static async generateMultipleThumbnails(imageBuffer, sizes = []) {
    try {
      const thumbnails = {};
      
      for (const size of sizes) {
        const { width, height, name, quality = 70, format = 'jpeg' } = size;
        
        const thumbnail = await this.generateThumbnail(imageBuffer, {
          width,
          height,
          quality,
          format
        });
        
        thumbnails[name] = thumbnail;
      }
      
      return thumbnails;
    } catch (error) {
      console.error('Erro na geração de múltiplos thumbnails:', error);
      throw new Error('Falha na geração dos thumbnails');
    }
  }

  /**
   * Detectar formato da imagem
   */
  static async detectImageFormat(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        hasAlpha: metadata.hasAlpha,
        isOpaque: metadata.isOpaque
      };
    } catch (error) {
      console.error('Erro na detecção de formato:', error);
      throw new Error('Falha na detecção do formato da imagem');
    }
  }

  /**
   * Converter imagem para WebP
   */
  static async convertToWebP(imageBuffer, quality = 80) {
    try {
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality })
        .toBuffer();
      
      return {
        buffer: webpBuffer,
        size: webpBuffer.length,
        format: 'webp'
      };
    } catch (error) {
      console.error('Erro na conversão para WebP:', error);
      throw new Error('Falha na conversão para WebP');
    }
  }

  /**
   * Converter imagem para AVIF
   */
  static async convertToAVIF(imageBuffer, quality = 80) {
    try {
      const avifBuffer = await sharp(imageBuffer)
        .avif({ quality })
        .toBuffer();
      
      return {
        buffer: avifBuffer,
        size: avifBuffer.length,
        format: 'avif'
      };
    } catch (error) {
      console.error('Erro na conversão para AVIF:', error);
      throw new Error('Falha na conversão para AVIF');
    }
  }

  /**
   * Comprimir imagem
   */
  static async compressImage(imageBuffer, quality = 60) {
    try {
      const compressedBuffer = await sharp(imageBuffer)
        .jpeg({ quality })
        .toBuffer();
      
      return {
        buffer: compressedBuffer,
        size: compressedBuffer.length,
        originalSize: imageBuffer.length,
        compressionRatio: ((imageBuffer.length - compressedBuffer.length) / imageBuffer.length * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Erro na compressão:', error);
      throw new Error('Falha na compressão da imagem');
    }
  }

  /**
   * Aplicar marca d'água
   */
  static async addWatermark(imageBuffer, watermarkBuffer, options = {}) {
    try {
      const {
        position = 'bottom-right',
        opacity = 0.3,
        margin = 20
      } = options;

      const image = sharp(imageBuffer);
      const watermark = sharp(watermarkBuffer);
      
      const imageMetadata = await image.metadata();
      const watermarkMetadata = await watermark.metadata();
      
      // Calcular posição da marca d'água
      let left, top;
      switch (position) {
        case 'top-left':
          left = margin;
          top = margin;
          break;
        case 'top-right':
          left = imageMetadata.width - watermarkMetadata.width - margin;
          top = margin;
          break;
        case 'bottom-left':
          left = margin;
          top = imageMetadata.height - watermarkMetadata.height - margin;
          break;
        case 'bottom-right':
        default:
          left = imageMetadata.width - watermarkMetadata.width - margin;
          top = imageMetadata.height - watermarkMetadata.height - margin;
          break;
        case 'center':
          left = (imageMetadata.width - watermarkMetadata.width) / 2;
          top = (imageMetadata.height - watermarkMetadata.height) / 2;
          break;
      }
      
      const watermarkedBuffer = await image
        .composite([{
          input: await watermark.png().toBuffer(),
          top: Math.max(0, Math.round(top)),
          left: Math.max(0, Math.round(left)),
          blend: 'over'
        }])
        .toBuffer();
      
      return {
        buffer: watermarkedBuffer,
        size: watermarkedBuffer.length
      };
    } catch (error) {
      console.error('Erro na aplicação de marca d\'água:', error);
      throw new Error('Falha na aplicação da marca d\'água');
    }
  }

  /**
   * Validar imagem
   */
  static async validateImage(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      // Verificar se é uma imagem válida
      if (!metadata.format) {
        throw new Error('Formato de imagem não suportado');
      }
      
      // Verificar tamanho mínimo
      if (metadata.width < 10 || metadata.height < 10) {
        throw new Error('Imagem muito pequena');
      }
      
      // Verificar tamanho máximo
      if (metadata.width > 10000 || metadata.height > 10000) {
        throw new Error('Imagem muito grande');
      }
      
      return {
        isValid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: imageBuffer.length
      };
    } catch (error) {
      console.error('Erro na validação da imagem:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Processar imagem completa (otimização + thumbnails)
   */
  static async processImage(imageBuffer, options = {}) {
    try {
      const {
        optimize = true,
        generateThumbnails = true,
        thumbnailSizes = [
          { name: 'small', width: 150, height: 150 },
          { name: 'medium', width: 300, height: 300 },
          { name: 'large', width: 600, height: 600 }
        ],
        quality = 80,
        format = 'jpeg'
      } = options;

      const result = {
        original: {
          size: imageBuffer.length
        },
        optimized: null,
        thumbnails: {}
      };

      // Validar imagem
      const validation = await this.validateImage(imageBuffer);
      if (!validation.isValid) {
        throw new Error(`Imagem inválida: ${validation.error}`);
      }

      // Otimizar imagem principal
      if (optimize) {
        result.optimized = await this.optimizeImage(imageBuffer, {
          quality,
          format
        });
      }

      // Gerar thumbnails
      if (generateThumbnails) {
        result.thumbnails = await this.generateMultipleThumbnails(
          result.optimized ? result.optimized.buffer : imageBuffer,
          thumbnailSizes
        );
      }

      return result;
    } catch (error) {
      console.error('Erro no processamento da imagem:', error);
      throw new Error(`Falha no processamento: ${error.message}`);
    }
  }
}

export default ImageOptimizationService;
