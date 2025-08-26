/**
 * CART CONTROLLER - Controller do Carrinho de Compras
 * 
 * Gerencia operações do carrinho de compras dos usuários
 */

import BaseController from './BaseController.js';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import Cart from '../model/Cart.js';
import Books from '../model/Books.js';
import connection from '../database/connection.js';

class CartController extends BaseController {
  constructor() {
    super(Cart, 'Carrinho');
    this.Cart = Cart;
    this.Books = Books;
  }

  /**
   * Obter carrinho do usuário
   */
  async getUserCart(req, res) {
    try {
      const userId = req.user.id;

      let cart = await this.Cart.findOne({
        where: { userId, status: 'ativo' }
      });

      // Se não existe carrinho, criar um novo
      if (!cart) {
        cart = await this.Cart.create({
          userId,
          items: [],
          subtotal: 0.00,
          frete: 0.00,
          desconto: 0.00,
          total: 0.00,
          status: 'ativo'
        });
      }

      // Buscar informações completas dos livros
      const itemsWithDetails = await this.getItemsWithDetails(cart.items);

      return ResponseHandler.success(res, {
        message: 'Carrinho encontrado',
        cart: {
          id: cart.id,
          items: itemsWithDetails,
          subtotal: parseFloat(cart.subtotal),
          frete: parseFloat(cart.frete),
          desconto: parseFloat(cart.desconto),
          total: parseFloat(cart.total),
          cupomCodigo: cart.cupomCodigo,
          cupomDesconto: cart.cupomDesconto ? parseFloat(cart.cupomDesconto) : null,
          enderecoEntrega: cart.enderecoEntrega,
          freteSelecionado: cart.freteSelecionado,
          status: cart.status,
          itemCount: itemsWithDetails.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      return ResponseHandler.badRequest(res, 'Erro ao buscar carrinho');
    }
  }

  /**
   * Adicionar item ao carrinho
   */
  async addItem(req, res) {
    try {
      const userId = req.user.id;
      const { bookId, quantity = 1 } = req.body;

      // Validações
      ValidationUtils.required(bookId, 'ID do livro');
      ValidationUtils.required(quantity, 'Quantidade');
      ValidationUtils.isInteger(bookId, 'ID do livro');
      ValidationUtils.isInteger(quantity, 'Quantidade');

      if (quantity <= 0) {
        return ResponseHandler.badRequest(res, 'Quantidade deve ser maior que zero');
      }

      // Verificar se o livro existe e tem estoque
      const book = await this.Books.findByPk(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      if (book.status !== 'ativo') {
        return ResponseHandler.badRequest(res, 'Livro não está disponível para compra');
      }

      if (book.estoque < quantity) {
        return ResponseHandler.badRequest(res, `Estoque insuficiente. Disponível: ${book.estoque}`);
      }

      // Buscar ou criar carrinho
      let cart = await this.Cart.findOne({
        where: { userId, status: 'ativo' }
      });

      if (!cart) {
        cart = await this.Cart.create({
          userId,
          items: [],
          subtotal: 0.00,
          frete: 0.00,
          desconto: 0.00,
          total: 0.00,
          status: 'ativo'
        });
      }

      // Verificar se o item já existe no carrinho
      const existingItemIndex = cart.items.findIndex(item => item.bookId === bookId);
      
      if (existingItemIndex >= 0) {
        // Atualizar quantidade
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > book.estoque) {
          return ResponseHandler.badRequest(res, `Estoque insuficiente. Disponível: ${book.estoque}`);
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].subtotal = book.preco * newQuantity;
      } else {
        // Adicionar novo item
        cart.items.push({
          bookId,
          quantity,
          preco: book.preco,
          subtotal: book.preco * quantity,
          titulo: book.titulo,
          autor: book.autor,
          imagemFront: book.imagemFront
        });
      }

      // Recalcular totais
      await this.recalculateCart(cart);

      // Recarregar cart atualizado do banco de dados
      await cart.reload();

      // Buscar informações completas dos livros
      const itemsWithDetails = await this.getItemsWithDetails(cart.items);

      return ResponseHandler.success(res, {
        message: 'Item adicionado ao carrinho',
        cart: {
          id: cart.id,
          items: itemsWithDetails,
          subtotal: parseFloat(cart.subtotal),
          frete: parseFloat(cart.frete),
          desconto: parseFloat(cart.desconto),
          total: parseFloat(cart.total),
          itemCount: itemsWithDetails.length
        }
      });

    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return ResponseHandler.badRequest(res, 'Erro ao adicionar item ao carrinho');
    }
  }

  /**
   * Atualizar quantidade de item
   */
  async updateItemQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { bookId, quantity } = req.body;

      // Validações
      ValidationUtils.required(bookId, 'ID do livro');
      ValidationUtils.required(quantity, 'Quantidade');
      ValidationUtils.isInteger(bookId, 'ID do livro');
      ValidationUtils.isInteger(quantity, 'Quantidade');

      if (quantity <= 0) {
        return ResponseHandler.badRequest(res, 'Quantidade deve ser maior que zero');
      }

      // Verificar se o livro existe e tem estoque
      const book = await this.Books.findByPk(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      if (book.estoque < quantity) {
        return ResponseHandler.badRequest(res, `Estoque insuficiente. Disponível: ${book.estoque}`);
      }

      // Buscar carrinho
      const cart = await this.Cart.findOne({
        where: { userId, status: 'ativo' }
      });

      if (!cart) {
        return ResponseHandler.notFound(res, 'Carrinho não encontrado');
      }

      // Encontrar e atualizar item
      const itemIndex = cart.items.findIndex(item => item.bookId === bookId);
      if (itemIndex === -1) {
        return ResponseHandler.notFound(res, 'Item não encontrado no carrinho');
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = book.preco * quantity;

      // Recalcular totais
      await this.recalculateCart(cart);

      // Buscar informações completas dos livros
      const itemsWithDetails = await this.getItemsWithDetails(cart.items);

      return ResponseHandler.success(res, {
        message: 'Quantidade atualizada',
        cart: {
          id: cart.id,
          items: itemsWithDetails,
          subtotal: parseFloat(cart.subtotal),
          frete: parseFloat(cart.frete),
          desconto: parseFloat(cart.desconto),
          total: parseFloat(cart.total),
          itemCount: itemsWithDetails.length
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      return ResponseHandler.badRequest(res, 'Erro ao atualizar quantidade');
    }
  }

  /**
   * Remover item do carrinho
   */
  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      // Validações
      ValidationUtils.required(bookId, 'ID do livro');
      ValidationUtils.isInteger(bookId, 'ID do livro');

      // Buscar carrinho
      const cart = await this.Cart.findOne({
        where: { userId, status: 'ativo' }
      });

      if (!cart) {
        return ResponseHandler.notFound(res, 'Carrinho não encontrado');
      }

      // Remover item
      cart.items = cart.items.filter(item => item.bookId !== parseInt(bookId));

      // Recalcular totais
      await this.recalculateCart(cart);

      // Buscar informações completas dos livros
      const itemsWithDetails = await this.getItemsWithDetails(cart.items);

      return ResponseHandler.success(res, {
        message: 'Item removido do carrinho',
        cart: {
          id: cart.id,
          items: itemsWithDetails,
          subtotal: parseFloat(cart.subtotal),
          frete: parseFloat(cart.frete),
          desconto: parseFloat(cart.desconto),
          total: parseFloat(cart.total),
          itemCount: itemsWithDetails.length
        }
      });

    } catch (error) {
      console.error('Erro ao remover item:', error);
      return ResponseHandler.badRequest(res, 'Erro ao remover item do carrinho');
    }
  }

  /**
   * Limpar carrinho
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      const cart = await this.Cart.findOne({
        where: { userId, status: 'ativo' }
      });

      if (!cart) {
        return ResponseHandler.notFound(res, 'Carrinho não encontrado');
      }

      // Limpar itens e recalcular
      cart.items = [];
      await this.recalculateCart(cart);

      return ResponseHandler.success(res, {
        message: 'Carrinho limpo com sucesso',
        cart: {
          id: cart.id,
          items: [],
          subtotal: 0.00,
          frete: 0.00,
          desconto: 0.00,
          total: 0.00,
          itemCount: 0
        }
      });

    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      return ResponseHandler.badRequest(res, 'Erro ao limpar carrinho');
    }
  }

  /**
   * Recalcular totais do carrinho
   */
  async recalculateCart(cart) {
    // Calcular subtotal com conversão segura para números
    const subtotal = cart.items.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.subtotal) || 0;
      return sum + itemSubtotal;
    }, 0);

    // Aplicar desconto do cupom se existir
    let desconto = 0;
    if (cart.cupomDesconto) {
      desconto = parseFloat(cart.cupomDesconto) || 0;
    }

    // Calcular total
    const frete = parseFloat(cart.frete) || 0;
    const total = subtotal + frete - desconto;

    // Atualizar carrinho (incluindo os items!)
    await cart.update({
      items: cart.items,  // ⭐ IMPORTANTE: Salvar os items também!
      subtotal: parseFloat(subtotal.toFixed(2)),
      desconto: parseFloat(desconto.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  }

  /**
   * Buscar informações completas dos livros
   */
  async getItemsWithDetails(items) {
    if (!items || items.length === 0) {
      return [];
    }

    const bookIds = items.map(item => item.bookId);
    const books = await this.Books.findAll({
      where: { id: bookIds }
    });

    return items.map(item => {
      const book = books.find(b => b.id === item.bookId);
      return {
        ...item,
        book: book ? {
          id: book.id,
          titulo: book.titulo,
          autor: book.autor,
          preco: parseFloat(book.preco),
          estoque: book.estoque,
          imagemFront: book.imagemFront,
          imagemBack: book.imagemBack
        } : null
      };
    });
  }
}

export default new CartController();
