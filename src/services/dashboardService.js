/**
 * DASHBOARD SERVICE - Serviço de Dashboard Administrativo
 * 
 * Fornece estatísticas, métricas e dados para o dashboard
 * administrativo da aplicação
 */

import connection from '../database/connection.js';
import { Op } from 'sequelize';

class DashboardService {
  constructor() {
    this.User = connection.models.User;
    this.Books = connection.models.Books;
    this.Purchases = connection.models.Purchases;
    this.PurchaseItems = connection.models.PurchaseItems;
  }

  /**
   * Obter estatísticas gerais do dashboard
   */
  async getGeneralStats() {
    try {
      const [
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        activeUsers,
        lowStockBooks,
        pendingOrders,
        todayOrders
      ] = await Promise.all([
        // Total de usuários
        this.User.count(),
        
        // Total de livros
        this.Books.count(),
        
        // Total de pedidos
        this.Purchases.count(),
        
        // Receita total
        this.Purchases.sum('total', {
          where: { status: { [Op.in]: ['pago', 'enviado', 'entregue'] } }
        }),
        
        // Usuários ativos (últimos 30 dias)
        this.User.count({
          where: {
            ultimoAcesso: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Livros com estoque baixo
        this.Books.count({
          where: {
            estoque: { [Op.lte]: 5 },
            status: 'ativo'
          }
        }),
        
        // Pedidos pendentes
        this.Purchases.count({
          where: { status: 'pendente' }
        }),
        
        // Pedidos de hoje
        this.Purchases.count({
          where: {
            createdAt: {
              [Op.gte]: new Date().setHours(0, 0, 0, 0)
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          totalBooks: totalBooks || 0,
          totalOrders: totalOrders || 0,
          totalRevenue: totalRevenue || 0,
          activeUsers: activeUsers || 0,
          lowStockBooks: lowStockBooks || 0,
          pendingOrders: pendingOrders || 0,
          todayOrders: todayOrders || 0
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas gerais:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter dados de vendas por período
   */
  async getSalesData(period = '30d') {
    try {
      let startDate;
      const endDate = new Date();

      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const sales = await this.Purchases.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          },
          status: { [Op.in]: ['pago', 'enviado', 'entregue'] }
        },
        attributes: [
          'id', 'total', 'createdAt', 'status'
        ],
        order: [['createdAt', 'ASC']]
      });

      // Agrupar por data
      const salesByDate = {};
      sales.forEach(sale => {
        const date = sale.createdAt.toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = {
            date,
            total: 0,
            count: 0
          };
        }
        salesByDate[date].total += parseFloat(sale.total);
        salesByDate[date].count += 1;
      });

      const salesData = Object.values(salesByDate);

      return {
        success: true,
        data: {
          period,
          sales: salesData,
          totalSales: salesData.reduce((sum, day) => sum + day.total, 0),
          totalOrders: salesData.reduce((sum, day) => sum + day.count, 0)
        }
      };

    } catch (error) {
      console.error('Erro ao obter dados de vendas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter livros mais vendidos
   */
  async getTopSellingBooks(limit = 10) {
    try {
      const topBooks = await this.Books.findAll({
        where: { status: 'ativo' },
        attributes: [
          'id', 'titulo', 'autor', 'preco', 'vendas', 
          'avaliacoes', 'totalAvaliacoes', 'imagemFront'
        ],
        order: [['vendas', 'DESC']],
        limit
      });

      return {
        success: true,
        data: topBooks
      };

    } catch (error) {
      console.error('Erro ao obter livros mais vendidos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter livros com estoque baixo
   */
  async getLowStockBooks(limit = 10) {
    try {
      const lowStockBooks = await this.Books.findAll({
        where: {
          estoque: { [Op.lte]: 10 },
          status: 'ativo'
        },
        attributes: [
          'id', 'titulo', 'autor', 'estoque', 'preco', 
          'vendas', 'imagemFront'
        ],
        order: [['estoque', 'ASC']],
        limit
      });

      return {
        success: true,
        data: lowStockBooks
      };

    } catch (error) {
      console.error('Erro ao obter livros com estoque baixo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter pedidos recentes
   */
  async getRecentOrders(limit = 10) {
    try {
      const recentOrders = await this.Purchases.findAll({
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        attributes: [
          'id', 'numero', 'total', 'status', 'createdAt', 
          'formaPagamento', 'codigoRastreamento'
        ],
        order: [['createdAt', 'DESC']],
        limit
      });

      return {
        success: true,
        data: recentOrders
      };

    } catch (error) {
      console.error('Erro ao obter pedidos recentes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de usuários
   */
  async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        verifiedUsers,
        usersByRole
      ] = await Promise.all([
        // Total de usuários
        this.User.count(),
        
        // Usuários ativos (últimos 30 dias)
        this.User.count({
          where: {
            ultimoAcesso: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Novos usuários este mês
        this.User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Usuários verificados
        this.User.count({
          where: { emailVerificado: true }
        }),
        
        // Usuários por role
        this.User.findAll({
          attributes: [
            'role',
            [connection.fn('COUNT', connection.col('id')), 'count']
          ],
          group: ['role'],
          raw: true
        })
      ]);

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsersThisMonth: newUsersThisMonth || 0,
          verifiedUsers: verifiedUsers || 0,
          usersByRole: usersByRole || []
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter estatísticas de livros
   */
  async getBookStats() {
    try {
      const [
        totalBooks,
        activeBooks,
        booksInStock,
        booksOutOfStock,
        booksByCategory,
        averagePrice
      ] = await Promise.all([
        // Total de livros
        this.Books.count(),
        
        // Livros ativos
        this.Books.count({
          where: { status: 'ativo' }
        }),
        
        // Livros em estoque
        this.Books.count({
          where: {
            estoque: { [Op.gt]: 0 },
            status: 'ativo'
          }
        }),
        
        // Livros sem estoque
        this.Books.count({
          where: {
            estoque: { [Op.lte]: 0 },
            status: 'ativo'
          }
        }),
        
        // Livros por categoria
        this.Books.findAll({
          attributes: [
            'categoria',
            [connection.fn('COUNT', connection.col('id')), 'count']
          ],
          where: { status: 'ativo' },
          group: ['categoria'],
          raw: true
        }),
        
        // Preço médio
        this.Books.findOne({
          attributes: [
            [connection.fn('AVG', connection.col('preco')), 'averagePrice']
          ],
          where: { status: 'ativo' },
          raw: true
        })
      ]);

      return {
        success: true,
        data: {
          totalBooks: totalBooks || 0,
          activeBooks: activeBooks || 0,
          booksInStock: booksInStock || 0,
          booksOutOfStock: booksOutOfStock || 0,
          booksByCategory: booksByCategory || [],
          averagePrice: averagePrice?.averagePrice || 0
        }
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de livros:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DashboardService();
