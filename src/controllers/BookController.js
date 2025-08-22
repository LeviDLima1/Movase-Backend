/**
 * BOOK CONTROLLER - Controller de Gerenciamento de Livros
 * 
 * Gerencia operações CRUD e funcionalidades específicas
 * para o catálogo de livros da livraria.
 */

import BaseController from './BaseController.js';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import connection from '../database/connection.js';
import Books from '../model/Books.js';
import Image from '../model/Image.js';

class BookController extends BaseController {
  constructor() {
    super(Books, 'Livro');
    this.Books = Books;
  }

  /**
   * Listar livros com filtros avançados
   */
  async listBooks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const {
        search,
        categoria,
        subcategoria,
        status,
        destaque,
        novidade,
        promocao,
        precoMin,
        precoMax,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // Construir condições WHERE
      const where = {};
      
      if (search) {
        where[connection.Sequelize.Op.or] = [
          { titulo: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { autor: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { descricao: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { sinopse: { [connection.Sequelize.Op.iLike]: `%${search}%` } }
        ];
      }

      if (categoria) where.categoria = categoria;
      if (subcategoria) where.subcategoria = subcategoria;
      if (status) where.status = status;
      if (destaque !== undefined) where.destaque = destaque === 'true';
      if (novidade !== undefined) where.novidade = novidade === 'true';
      if (promocao !== undefined) where.promocao = promocao === 'true';

      // Filtro de preço
      if (precoMin || precoMax) {
        where.preco = {};
        if (precoMin) where.preco[connection.Sequelize.Op.gte] = parseFloat(precoMin);
        if (precoMax) where.preco[connection.Sequelize.Op.lte] = parseFloat(precoMax);
      }

      // Opções de consulta
      const options = {
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      };

      const { count, rows } = await this.Books.findAndCountAll(options);

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livro por ID
   */
  async getBookById(req, res, next) {
    try {
      const { id } = req.params;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const book = await this.Books.findByPk(id);

      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      // Incrementar visualizações
      await book.increment('visualizacoes');

      return ResponseHandler.success(res, book);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo livro
   */
  async createBook(req, res, next) {
    try {
      const {
        titulo,
        autor,
        descricao,
        sinopse,
        isbn,
        paginas,
        ano,
        editora,
        idioma = 'Português',
        formato = 'Físico',
        peso,
        dimensoes,
        categoria,
        subcategoria,
        tags = [],
        preco,
        precoOriginal,
        estoque = 0,
        status = 'ativo',
        destaque = false,
        novidade = false,
        promocao = false,
        imagemFront,
        imagemBack
      } = req.body;

      // Validações obrigatórias
      ValidationUtils.required(titulo, 'Título');
      ValidationUtils.required(autor, 'Autor');
      ValidationUtils.required(categoria, 'Categoria');
      ValidationUtils.required(preco, 'Preço');

      // Validações de formato
      if (isbn) ValidationUtils.isbn(isbn);
      if (preco) ValidationUtils.isPositiveNumber(preco, 'Preço');
      if (precoOriginal) ValidationUtils.isPositiveNumber(precoOriginal, 'Preço Original');
      if (estoque !== undefined) ValidationUtils.isInteger(estoque, 'Estoque');

      // Verificar se ISBN já existe
      if (isbn) {
        const existingBook = await this.Books.findOne({ where: { isbn } });
        if (existingBook) {
          return ResponseHandler.conflict(res, 'ISBN já cadastrado');
        }
      }

      // Criar livro
      const book = await this.Books.create({
        titulo,
        autor,
        descricao,
        sinopse,
        isbn,
        paginas,
        ano,
        editora,
        idioma,
        formato,
        peso,
        dimensoes,
        categoria,
        subcategoria,
        tags,
        preco,
        precoOriginal,
        estoque,
        status,
        destaque,
        novidade,
        promocao,
        imagemFront,
        imagemBack
      });

      return ResponseHandler.created(res, book, 'Livro criado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar livro
   */
  async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const book = await this.Books.findByPk(id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      // Validações específicas
      if (updateData.isbn && updateData.isbn !== book.isbn) {
        ValidationUtils.isbn(updateData.isbn);
        const existingBook = await this.Books.findOne({
          where: { isbn: updateData.isbn, id: { [connection.Sequelize.Op.ne]: id } }
        });
        if (existingBook) {
          return ResponseHandler.conflict(res, 'ISBN já cadastrado');
        }
      }

      if (updateData.preco) ValidationUtils.isPositiveNumber(updateData.preco, 'Preço');
      if (updateData.precoOriginal) ValidationUtils.isPositiveNumber(updateData.precoOriginal, 'Preço Original');
      if (updateData.estoque !== undefined) ValidationUtils.isInteger(updateData.estoque, 'Estoque');

      // Atualizar livro
      await book.update(updateData);

      return ResponseHandler.success(res, book, 'Livro atualizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros por categoria
   */
  async getBooksByCategory(req, res, next) {
    try {
      const { categoria } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      ValidationUtils.required(categoria, 'Categoria');

      const { count, rows } = await this.Books.findAndCountAll({
        where: { categoria, status: 'ativo' },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros em destaque
   */
  async getFeaturedBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;

      const books = await this.Books.findAll({
        where: { destaque: true, status: 'ativo' },
        limit,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, books);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros novos
   */
  async getNewBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;

      const books = await this.Books.findAll({
        where: { novidade: true, status: 'ativo' },
        limit,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, books);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros em promoção
   */
  async getPromotionalBooks(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;

      const books = await this.Books.findAll({
        where: { promocao: true, status: 'ativo' },
        limit,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, books);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros por tags
   */
  async getBooksByTags(req, res, next) {
    try {
      const { tags } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      if (!tags) {
        return ResponseHandler.badRequest(res, 'Tags não fornecidas');
      }

      const tagArray = tags.split(',');

      const { count, rows } = await this.Books.findAndCountAll({
        where: {
          status: 'ativo',
          tags: {
            [connection.Sequelize.Op.overlap]: tagArray
          }
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros por autor
   */
  async getBooksByAuthor(req, res, next) {
    try {
      const { autor } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      ValidationUtils.required(autor, 'Autor');

      const { count, rows } = await this.Books.findAndCountAll({
        where: { 
          autor: { [connection.Sequelize.Op.iLike]: `%${autor}%` },
          status: 'ativo'
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar estoque do livro
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { estoque, operacao = 'set' } = req.body; // operacao: 'set', 'add', 'subtract'

      ValidationUtils.required(id, 'ID');
      ValidationUtils.required(estoque, 'Estoque');
      ValidationUtils.isInteger(id, 'ID');
      ValidationUtils.isInteger(estoque, 'Estoque');

      const book = await this.Books.findByPk(id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      let newStock;
      switch (operacao) {
        case 'set':
          newStock = estoque;
          break;
        case 'add':
          newStock = book.estoque + estoque;
          break;
        case 'subtract':
          newStock = book.estoque - estoque;
          if (newStock < 0) {
            return ResponseHandler.badRequest(res, 'Estoque insuficiente');
          }
          break;
        default:
          return ResponseHandler.badRequest(res, 'Operação inválida');
      }

      await book.update({ estoque: newStock });

      return ResponseHandler.success(res, book, 'Estoque atualizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar avaliação do livro
   */
  async updateRating(req, res, next) {
    try {
      const { id } = req.params;
      const { avaliacao, comentario } = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.required(avaliacao, 'Avaliação');
      ValidationUtils.isInteger(id, 'ID');
      ValidationUtils.isPositiveNumber(avaliacao, 'Avaliação');

      if (avaliacao < 1 || avaliacao > 5) {
        return ResponseHandler.badRequest(res, 'Avaliação deve estar entre 1 e 5');
      }

      const book = await this.Books.findByPk(id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      // Calcular nova média
      const totalAvaliacoes = book.totalAvaliacoes + 1;
      const novaMedia = ((book.avaliacoes * book.totalAvaliacoes) + avaliacao) / totalAvaliacoes;

      await book.update({
        avaliacoes: novaMedia,
        totalAvaliacoes
      });

      return ResponseHandler.success(res, book, 'Avaliação atualizada com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas de livros
   */
  async getBookStats(req, res, next) {
    try {
      const [
        totalBooks,
        activeBooks,
        inactiveBooks,
        featuredBooks,
        newBooks,
        promotionalBooks,
        lowStockBooks,
        outOfStockBooks
      ] = await Promise.all([
        this.Books.count(),
        this.Books.count({ where: { status: 'ativo' } }),
        this.Books.count({ where: { status: 'inativo' } }),
        this.Books.count({ where: { destaque: true, status: 'ativo' } }),
        this.Books.count({ where: { novidade: true, status: 'ativo' } }),
        this.Books.count({ where: { promocao: true, status: 'ativo' } }),
        this.Books.count({ where: { estoque: { [connection.Sequelize.Op.lt]: 10 }, status: 'ativo' } }),
        this.Books.count({ where: { estoque: 0, status: 'ativo' } })
      ]);

      const stats = {
        total: totalBooks,
        byStatus: {
          ativo: activeBooks,
          inativo: inactiveBooks
        },
        featured: featuredBooks,
        new: newBooks,
        promotional: promotionalBooks,
        stock: {
          low: lowStockBooks,
          out: outOfStockBooks
        }
      };

      return ResponseHandler.success(res, stats);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar livros similares
   */
  async getSimilarBooks(req, res, next) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 4;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const book = await this.Books.findByPk(id);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      const similarBooks = await this.Books.findAll({
        where: {
          id: { [connection.Sequelize.Op.ne]: id },
          status: 'ativo',
          [connection.Sequelize.Op.or]: [
            { categoria: book.categoria },
            { subcategoria: book.subcategoria },
            { autor: book.autor }
          ]
        },
        limit,
        order: [['avaliacoes', 'DESC'], ['vendas', 'DESC']]
      });

      return ResponseHandler.success(res, similarBooks);

    } catch (error) {
      next(error);
    }
  }

  // Buscar imagens do livro
  async getBookImages(req, res) {
    try {
      const { id } = req.params;
      console.log('Buscando imagens para o livro:', id);
      
      // Validar ID
      if (!id || isNaN(parseInt(id))) {
        return ResponseHandler.badRequest(res, 'ID do livro inválido');
      }
      
      const images = await Image.findBookImages(parseInt(id));
      console.log('Imagens encontradas:', images.length);
      
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
      return ResponseHandler.badRequest(res, `Erro ao buscar imagens do livro: ${error.message}`);
    }
  }
}

export default BookController;
