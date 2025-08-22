import express from 'express';
import multer from 'multer';
import ImageController from '../controllers/ImageController.js';
import AuthMiddleware from '../middleware/authMiddleware.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();
const imageController = ImageController;

// Configuração do Multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

// ===== ROTAS PÚBLICAS =====

// Download de imagem por ID
router.get('/:id', ErrorHandler.asyncHandler(imageController.download.bind(imageController)));

// Thumbnail de imagem
router.get('/:id/thumbnail', ErrorHandler.asyncHandler(imageController.thumbnail.bind(imageController)));

// Buscar imagens por entidade
router.get('/entity/:entityType/:entityId', ErrorHandler.asyncHandler(imageController.findByEntity.bind(imageController)));
router.get('/entity/:entityType/:entityId/:imageType', ErrorHandler.asyncHandler(imageController.findByEntity.bind(imageController)));

// Buscar imagens de um livro específico
router.get('/book/:bookId', ErrorHandler.asyncHandler(imageController.findBookImages.bind(imageController)));

// ===== ROTAS AUTENTICADAS =====

// Upload de imagem (requer autenticação)
router.post('/upload', AuthMiddleware.authenticate, upload.single('image'), ErrorHandler.asyncHandler(imageController.upload.bind(imageController)));

// Atualizar ordem das imagens
router.put('/order', AuthMiddleware.authenticate, ErrorHandler.asyncHandler(imageController.updateOrder.bind(imageController)));

// Deletar imagem
router.delete('/:id', AuthMiddleware.authenticate, ErrorHandler.asyncHandler(imageController.delete.bind(imageController)));

// ===== ROTAS ADMIN =====

// Listar todas as imagens (admin)
router.get('/', AuthMiddleware.authenticate, ErrorHandler.asyncHandler(imageController.list.bind(imageController)));

// Buscar imagem por ID (admin)
router.get('/admin/:id', AuthMiddleware.authenticate, ErrorHandler.asyncHandler(imageController.getById.bind(imageController)));

// Atualizar metadados da imagem
router.put('/:id', AuthMiddleware.authenticate, ErrorHandler.asyncHandler(imageController.update.bind(imageController)));

export default router;
