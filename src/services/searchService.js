/**
 * SEARCH SERVICE - Serviço de Busca Avançada
 * 
 * Sistema de busca com filtros avançados, paginação
 * e ordenação para livros e outros recursos
 */

import connection from '../database/connection.js';
import { Op } from 'sequelize';

class SearchService {
  constructor() {
    this.Books = connection.models.Books;
  }

  /**
   * Buscar livros com filtros avançados
   */
  async searchBooks(filters = {}, pagination = {}) {
    try {
      const {
        query = '',
        category = '',
        author = '',
        minPrice = 0,
        maxPrice = null,
        status = 'ativo',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        page = 1,
        limit = 20
      } = filters;

      const {
        page: paginationPage = page,
        limit: paginationLimit = limit
      } = pagination;

      // Construir condições de busca
      const whereConditions = {
        status: status
      };

      // Busca por texto (título, sinopse, autor)
      if (query) {
        whereConditions[Op.or] = [
          { titulo: { [Op.iLike]: `%${query}%` } },
          { sinopse: { [Op.iLike]: `%${query}%` } },
          { autor: { [Op.iLike]: `%${query}%` } },
          { isbn: { [Op.iLike]: `%${query}%` } }
        ];
      }

      // Filtro por categoria
      if (category) {
        whereConditions.categoria = category;
      }

      // Filtro por autor
      if (author) {
        whereConditions.autor = { [Op.iLike]: `%${author}%` };
      }

      // Filtro por preço
      if (minPrice > 0 || maxPrice) {
        whereConditions.preco = {};
        if (minPrice > 0) {
          whereConditions.preco[Op.gte] = minPrice;
        }
        if (maxPrice) {
          whereConditions.preco[Op.lte] = maxPrice;
        }
      }

      // Configurar ordenação
      const order = [[sortBy, sortOrder.toUpperCase()]];

      // Configurar paginação
      const offset = (paginationPage - 1) * paginationLimit;

      // Executar busca
      const { count, rows } = await this.Books.findAndCountAll({
        where: whereConditions,
        order,
        limit: paginationLimit,
        offset,
        attributes: [
          'id', 'titulo', 'autor', 'isbn', 'categoria', 'preco', 
          'precoOriginal', 'estoque', 'imagemFront', 'destaque', 
          'novidade', 'promocao', 'avaliacoes', 'totalAvaliacoes',
          'vendas', 'visualizacoes', 'createdAt'
        ]
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(count / paginationLimit);
      const hasNextPage = paginationPage < totalPages;
      const hasPrevPage = paginationPage > 1;

      return {
        success: true,
        data: {
          books: rows,
          pagination: {
            currentPage: paginationPage,
            totalPages,
            totalItems: count,
            itemsPerPage: paginationLimit,
            hasNextPage,
            hasPrevPage
          },
          filters: {
            query,
            category,
            author,
            minPrice,
            maxPrice,
            status,
            sortBy,
            sortOrder
          }
        }
      };

    } catch (error) {
      console.error('Erro na busca de livros:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar livros em destaque
   */
  async getFeaturedBooks(limit = 10) {
    try {
      const books = await this.Books.findAll({
        where: {
          destaque: true,
          status: 'ativo',
          estoque: { [Op.gt]: 0 }
        },
        order: [['vendas', 'DESC'], ['avaliacoes', 'DESC']],
        limit,
        attributes: [
          'id', 'titulo', 'autor', 'preco', 'precoOriginal', 
          'imagemFront', 'avaliacoes', 'totalAvaliacoes', 'vendas'
        ]
      });

      return {
        success: true,
        data: books
      };

    } catch (error) {
      console.error('Erro ao buscar livros em destaque:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar livros novos
   */
  async getNewBooks(limit = 10) {
    try {
      const books = await this.Books.findAll({
        where: {
          novidade: true,
          status: 'ativo'
        },
        order: [['createdAt', 'DESC']],
        limit,
        attributes: [
          'id', 'titulo', 'autor', 'preco', 'precoOriginal', 
          'imagemFront', 'createdAt'
        ]
      });

      return {
        success: true,
        data: books
      };

    } catch (error) {
      console.error('Erro ao buscar livros novos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar livros em promoção
   */
  async getPromotionalBooks(limit = 10) {
    try {
      const books = await this.Books.findAll({
        where: {
          promocao: true,
          status: 'ativo',
          estoque: { [Op.gt]: 0 }
        },
        order: [['preco', 'ASC']],
        limit,
        attributes: [
          'id', 'titulo', 'autor', 'preco', 'precoOriginal', 
          'imagemFront', 'desconto'
        ]
      });

      return {
        success: true,
        data: books
      };

    } catch (error) {
      console.error('Erro ao buscar livros em promoção:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar livros similares
   */
  async getSimilarBooks(bookId, limit = 5) {
    try {
      // Buscar o livro atual
      const currentBook = await this.Books.findByPk(bookId);
      if (!currentBook) {
        return {
          success: false,
          error: 'Livro não encontrado'
        };
      }

      // Buscar livros similares (mesma categoria ou autor)
      const similarBooks = await this.Books.findAll({
        where: {
          id: { [Op.ne]: bookId },
          status: 'ativo',
          estoque: { [Op.gt]: 0 },
          [Op.or]: [
            { categoria: currentBook.categoria },
            { autor: currentBook.autor }
          ]
        },
        order: [['vendas', 'DESC'], ['avaliacoes', 'DESC']],
        limit,
        attributes: [
          'id', 'titulo', 'autor', 'preco', 'precoOriginal', 
          'imagemFront', 'categoria', 'avaliacoes', 'totalAvaliacoes'
        ]
      });

      return {
        success: true,
        data: similarBooks
      };

    } catch (error) {
      console.error('Erro ao buscar livros similares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar categorias disponíveis
   */
  async getCategories() {
    try {
      const categories = await this.Books.findAll({
        where: { status: 'ativo' },
        attributes: [
          [connection.fn('DISTINCT', connection.col('categoria')), 'categoria']
        ],
        raw: true
      });

      return {
        success: true,
        data: categories.map(cat => cat.categoria).filter(Boolean)
      };

    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar autores disponíveis
   */
  async getAuthors() {
    try {
      const authors = await this.Books.findAll({
        where: { status: 'ativo' },
        attributes: [
          [connection.fn('DISTINCT', connection.col('autor')), 'autor']
        ],
        raw: true
      });

      return {
        success: true,
        data: authors.map(auth => auth.autor).filter(Boolean)
      };

    } catch (error) {
      console.error('Erro ao buscar autores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new SearchService();
