/**
 * PURCHASE CONTROLLER - Controller de Gerenciamento de Compras
 * 
 * Gerencia operações CRUD e funcionalidades específicas
 * para o sistema de compras da livraria.
 */

import BaseController from './BaseController.js';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import connection from '../database/connection.js';

class PurchaseController extends BaseController {
  constructor() {
    super(connection.models.Purchases, 'Compra');
    this.Purchases = connection.models.Purchases;
    this.PurchaseItems = connection.models.PurchaseItems;
    this.Books = connection.models.Books;
    this.User = connection.models.User;
    this.Address = connection.models.Address;
  }

  /**
   * Listar compras com filtros avançados
   */
  async listPurchases(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const {
        search,
        status,
        formaPagamento,
        dataInicio,
        dataFim,
        valorMin,
        valorMax,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // Construir condições WHERE
      const where = {};
      
      if (search) {
        where[connection.Sequelize.Op.or] = [
          { numero: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { '$user.name$': { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { '$user.email$': { [connection.Sequelize.Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) where.status = status;
      if (formaPagamento) where.formaPagamento = formaPagamento;

      // Filtro de data
      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt[connection.Sequelize.Op.gte] = new Date(dataInicio);
        if (dataFim) where.createdAt[connection.Sequelize.Op.lte] = new Date(dataFim);
      }

      // Filtro de valor
      if (valorMin || valorMax) {
        where.total = {};
        if (valorMin) where.total[connection.Sequelize.Op.gte] = parseFloat(valorMin);
        if (valorMax) where.total[connection.Sequelize.Op.lte] = parseFloat(valorMax);
      }

      // Opções de consulta
      const options = {
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'telefone']
          },
          {
            model: this.Address,
            as: 'address',
            attributes: ['id', 'cep', 'logradouro', 'numero', 'cidade', 'uf']
          }
        ]
      };

      const { count, rows } = await this.Purchases.findAndCountAll(options);

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar compra por ID com detalhes
   */
  async getPurchaseById(req, res, next) {
    try {
      const { id } = req.params;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const purchase = await this.Purchases.findByPk(id, {
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'telefone', 'CPF']
          },
          {
            model: this.Address,
            as: 'address',
            attributes: ['id', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf']
          },
          {
            model: this.PurchaseItems,
            as: 'items',
            include: [
              {
                model: this.Books,
                as: 'book',
                attributes: ['id', 'titulo', 'autor', 'preco', 'imagemFront']
              }
            ]
          }
        ]
      });

      if (!purchase) {
        return ResponseHandler.notFound(res, 'Compra não encontrada');
      }

      return ResponseHandler.success(res, purchase);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar nova compra
   */
  async createPurchase(req, res, next) {
    try {
      const {
        userId,
        addressId,
        items,
        formaPagamento = 'pix',
        parcelas = 1,
        observacoes
      } = req.body;

      // Validações obrigatórias
      ValidationUtils.required(userId, 'ID do usuário');
      ValidationUtils.required(addressId, 'ID do endereço');
      ValidationUtils.required(items, 'Itens da compra');
      ValidationUtils.isInteger(userId, 'ID do usuário');
      ValidationUtils.isInteger(addressId, 'ID do endereço');

      if (!Array.isArray(items) || items.length === 0) {
        return ResponseHandler.badRequest(res, 'A compra deve ter pelo menos um item');
      }

      // Verificar se usuário existe
      const user = await this.User.findByPk(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Verificar se endereço existe
      const address = await this.Address.findByPk(addressId);
      if (!address) {
        return ResponseHandler.notFound(res, 'Endereço não encontrado');
      }

      // Calcular totais e verificar estoque
      let subtotal = 0;
      const purchaseItems = [];

      for (const item of items) {
        const book = await this.Books.findByPk(item.bookId);
        if (!book) {
          return ResponseHandler.notFound(res, `Livro com ID ${item.bookId} não encontrado`);
        }

        if (book.estoque < item.quantidade) {
          return ResponseHandler.badRequest(res, `Estoque insuficiente para o livro "${book.titulo}"`);
        }

        const itemTotal = book.preco * item.quantidade;
        subtotal += itemTotal;

        purchaseItems.push({
          bookId: item.bookId,
          quantidade: item.quantidade,
          precoUnitario: book.preco,
          precoTotal: itemTotal,
          desconto: item.desconto || 0,
          precoFinal: itemTotal - (item.desconto || 0)
        });
      }

      // Calcular frete (exemplo simples)
      const frete = subtotal > 100 ? 0 : 15;
      const total = subtotal + frete;

      // Gerar número do pedido
      const data = new Date();
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      const hora = String(data.getHours()).padStart(2, '0');
      const minuto = String(data.getMinutes()).padStart(2, '0');
      const segundo = String(data.getSeconds()).padStart(2, '0');
      const numero = `PED-${ano}${mes}${dia}-${hora}${minuto}${segundo}`;

      // Criar compra
      const purchase = await this.Purchases.create({
        userId,
        addressId,
        numero,
        subtotal,
        frete,
        desconto: 0, // Adicionar desconto
        total,
        formaPagamento,
        parcelas,
        observacoes,
        status: 'pendente'
      });

      // Criar itens da compra
      for (const item of purchaseItems) {
        await this.PurchaseItems.create({
          purchaseId: purchase.id,
          ...item
        });

        // Atualizar estoque do livro
        const book = await this.Books.findByPk(item.bookId);
        await book.update({
          estoque: book.estoque - item.quantidade,
          vendas: (book.vendas || 0) + item.quantidade
        });
      }

      // Buscar compra com relacionamentos
      const purchaseWithDetails = await this.Purchases.findByPk(purchase.id, {
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.Address,
            as: 'address',
            attributes: ['id', 'cep', 'logradouro', 'numero', 'cidade', 'uf']
          },
          {
            model: this.PurchaseItems,
            as: 'items',
            include: [
              {
                model: this.Books,
                as: 'book',
                attributes: ['id', 'titulo', 'autor', 'imagemFront']
              }
            ]
          }
        ]
      });

      return ResponseHandler.created(res, purchaseWithDetails, 'Compra criada com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar status da compra
   */
  async updatePurchaseStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.required(status, 'Status');
      ValidationUtils.isInteger(id, 'ID');

      const validStatuses = ['pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado', 'devolvido'];
      if (!validStatuses.includes(status)) {
        return ResponseHandler.badRequest(res, 'Status inválido');
      }

      const purchase = await this.Purchases.findByPk(id);
      if (!purchase) {
        return ResponseHandler.notFound(res, 'Compra não encontrada');
      }

      // Se estiver cancelando, devolver estoque
      if (status === 'cancelado' && purchase.status !== 'cancelado') {
        const items = await this.PurchaseItems.findAll({
          where: { purchaseId: id },
          include: [{ model: this.Books, as: 'book' }]
        });

        for (const item of items) {
          await item.book.update({
            estoque: item.book.estoque + item.quantidade,
            vendas: item.book.vendas - item.quantidade
          });
        }
      }

      await purchase.update({ status, observacoes });

      return ResponseHandler.success(res, purchase, `Status alterado para ${status}`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar compras do usuário
   */
  async getUserPurchases(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { status } = req.query;

      const where = { userId };
      if (status) where.status = status;

      const { count, rows } = await this.Purchases.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: this.PurchaseItems,
            as: 'items',
            include: [
              {
                model: this.Books,
                as: 'book',
                attributes: ['id', 'titulo', 'autor', 'imagemFront']
              }
            ]
          }
        ]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas de compras
   */
  async getPurchaseStats(req, res, next) {
    try {
      const [
        totalPurchases,
        pendingPurchases,
        paidPurchases,
        deliveredPurchases,
        cancelledPurchases,
        totalRevenue,
        monthlyRevenue
      ] = await Promise.all([
        this.Purchases.count(),
        this.Purchases.count({ where: { status: 'pendente' } }),
        this.Purchases.count({ where: { status: 'pago' } }),
        this.Purchases.count({ where: { status: 'entregue' } }),
        this.Purchases.count({ where: { status: 'cancelado' } }),
        this.Purchases.sum('total', { where: { status: 'entregue' } }),
        this.Purchases.sum('total', {
          where: {
            status: 'entregue',
            createdAt: {
              [connection.Sequelize.Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      ]);

      const stats = {
        total: totalPurchases,
        byStatus: {
          pendente: pendingPurchases,
          pago: paidPurchases,
          entregue: deliveredPurchases,
          cancelado: cancelledPurchases
        },
        revenue: {
          total: totalRevenue || 0,
          monthly: monthlyRevenue || 0
        }
      };

      return ResponseHandler.success(res, stats);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar compras por período
   */
  async getPurchasesByPeriod(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;

      ValidationUtils.required(dataInicio, 'Data de início');
      ValidationUtils.required(dataFim, 'Data de fim');

      const purchases = await this.Purchases.findAll({
        where: {
          createdAt: {
            [connection.Sequelize.Op.between]: [new Date(dataInicio), new Date(dataFim)]
          }
        },
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: this.PurchaseItems,
            as: 'items',
            include: [
              {
                model: this.Books,
                as: 'book',
                attributes: ['id', 'titulo', 'autor']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, purchases);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Adicionar item à compra
   */
  async addItemToPurchase(req, res, next) {
    try {
      const { id } = req.params;
      const { bookId, quantidade, desconto = 0 } = req.body;

      ValidationUtils.required(id, 'ID da compra');
      ValidationUtils.required(bookId, 'ID do livro');
      ValidationUtils.required(quantidade, 'Quantidade');
      ValidationUtils.isInteger(id, 'ID da compra');
      ValidationUtils.isInteger(bookId, 'ID do livro');
      ValidationUtils.isInteger(quantidade, 'Quantidade');

      const purchase = await this.Purchases.findByPk(id);
      if (!purchase) {
        return ResponseHandler.notFound(res, 'Compra não encontrada');
      }

      if (purchase.status !== 'pendente') {
        return ResponseHandler.badRequest(res, 'Não é possível alterar uma compra já processada');
      }

      const book = await this.Books.findByPk(bookId);
      if (!book) {
        return ResponseHandler.notFound(res, 'Livro não encontrado');
      }

      if (book.estoque < quantidade) {
        return ResponseHandler.badRequest(res, 'Estoque insuficiente');
      }

      const precoTotal = book.preco * quantidade;
      const precoFinal = precoTotal - desconto;

      // Criar item
      const item = await this.PurchaseItems.create({
        purchaseId: id,
        bookId,
        quantidade,
        precoUnitario: book.preco,
        precoTotal,
        desconto,
        precoFinal
      });

      // Atualizar estoque
      await book.update({
        estoque: book.estoque - quantidade,
        vendas: (book.vendas || 0) + quantidade
      });

      // Recalcular totais da compra
      const items = await this.PurchaseItems.findAll({ where: { purchaseId: id } });
      const subtotal = items.reduce((sum, item) => sum + item.precoTotal, 0);
      const frete = subtotal > 100 ? 0 : 15;
      const total = subtotal + frete;

      await purchase.update({ subtotal, frete, total });

      return ResponseHandler.success(res, item, 'Item adicionado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Remover item da compra
   */
  async removeItemFromPurchase(req, res, next) {
    try {
      const { id, itemId } = req.params;

      ValidationUtils.required(id, 'ID da compra');
      ValidationUtils.required(itemId, 'ID do item');
      ValidationUtils.isInteger(id, 'ID da compra');
      ValidationUtils.isInteger(itemId, 'ID do item');

      const purchase = await this.Purchases.findByPk(id);
      if (!purchase) {
        return ResponseHandler.notFound(res, 'Compra não encontrada');
      }

      if (purchase.status !== 'pendente') {
        return ResponseHandler.badRequest(res, 'Não é possível alterar uma compra já processada');
      }

      const item = await this.PurchaseItems.findByPk(itemId);
      if (!item || item.purchaseId !== parseInt(id)) {
        return ResponseHandler.notFound(res, 'Item não encontrado');
      }

      // Devolver estoque
      const book = await this.Books.findByPk(item.bookId);
      await book.update({
        estoque: book.estoque + item.quantidade,
        vendas: book.vendas - item.quantidade
      });

      // Remover item
      await item.destroy();

      // Recalcular totais da compra
      const items = await this.PurchaseItems.findAll({ where: { purchaseId: id } });
      const subtotal = items.reduce((sum, item) => sum + item.precoTotal, 0);
      const frete = subtotal > 100 ? 0 : 15;
      const total = subtotal + frete;

      await purchase.update({ subtotal, frete, total });

      return ResponseHandler.success(res, null, 'Item removido com sucesso');

    } catch (error) {
      next(error);
    }
  }
}

export default PurchaseController;
