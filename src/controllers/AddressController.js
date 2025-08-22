/**
 * ADDRESS CONTROLLER - Controller de Gerenciamento de Endereços
 * 
 * Gerencia operações CRUD e funcionalidades específicas
 * para o sistema de endereços dos usuários.
 */

import BaseController from './BaseController.js';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import connection from '../database/connection.js';

class AddressController extends BaseController {
  constructor() {
    super(connection.models.Address, 'Endereço');
    this.Address = connection.models.Address;
    this.User = connection.models.User;
  }

  /**
   * Listar endereços do usuário logado
   */
  async getUserAddresses(req, res, next) {
    try {
      const userId = req.user.id;

      const addresses = await this.Address.findAll({
        where: { userId },
        order: [['principal', 'DESC'], ['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, addresses);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereço por ID (próprio do usuário)
   */
  async getUserAddressById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const address = await this.Address.findOne({
        where: { id, userId }
      });

      if (!address) {
        return ResponseHandler.notFound(res, 'Endereço não encontrado');
      }

      return ResponseHandler.success(res, address);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo endereço para o usuário
   */
  async createUserAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        pais = 'Brasil',
        tipo = 'entrega',
        principal = false,
        observacoes
      } = req.body;

      // Validações obrigatórias
      ValidationUtils.required(cep, 'CEP');
      ValidationUtils.required(logradouro, 'Logradouro');
      ValidationUtils.required(numero, 'Número');
      ValidationUtils.required(bairro, 'Bairro');
      ValidationUtils.required(cidade, 'Cidade');
      ValidationUtils.required(uf, 'UF');

      // Validações de formato
      ValidationUtils.cep(cep);
      ValidationUtils.uf(uf);

      // Se for principal, desmarcar outros endereços principais
      if (principal) {
        await this.Address.update(
          { principal: false },
          { where: { userId, principal: true } }
        );
      }

      // Criar endereço
      const address = await this.Address.create({
        userId,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        pais,
        tipo,
        principal,
        observacoes
      });

      return ResponseHandler.created(res, address, 'Endereço criado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar endereço do usuário
   */
  async updateUserAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const address = await this.Address.findOne({
        where: { id, userId }
      });

      if (!address) {
        return ResponseHandler.notFound(res, 'Endereço não encontrado');
      }

      // Validações específicas
      if (updateData.cep) ValidationUtils.cep(updateData.cep);
      if (updateData.uf) ValidationUtils.uf(updateData.uf);

      // Se estiver marcando como principal, desmarcar outros
      if (updateData.principal) {
        await this.Address.update(
          { principal: false },
          { where: { userId, principal: true, id: { [connection.Sequelize.Op.ne]: id } } }
        );
      }

      // Atualizar endereço
      await address.update(updateData);

      return ResponseHandler.success(res, address, 'Endereço atualizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletar endereço do usuário
   */
  async deleteUserAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const address = await this.Address.findOne({
        where: { id, userId }
      });

      if (!address) {
        return ResponseHandler.notFound(res, 'Endereço não encontrado');
      }

      // Verificar se é o único endereço
      const addressCount = await this.Address.count({ where: { userId } });
      if (addressCount === 1) {
        return ResponseHandler.badRequest(res, 'Não é possível deletar o único endereço');
      }

      await address.destroy();

      return ResponseHandler.success(res, null, 'Endereço deletado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Definir endereço como principal
   */
  async setMainAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const address = await this.Address.findOne({
        where: { id, userId }
      });

      if (!address) {
        return ResponseHandler.notFound(res, 'Endereço não encontrado');
      }

      // Desmarcar todos os outros endereços como principais
      await this.Address.update(
        { principal: false },
        { where: { userId } }
      );

      // Marcar este como principal
      await address.update({ principal: true });

      return ResponseHandler.success(res, address, 'Endereço definido como principal');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereço principal do usuário
   */
  async getMainAddress(req, res, next) {
    try {
      const userId = req.user.id;

      const address = await this.Address.findOne({
        where: { userId, principal: true }
      });

      if (!address) {
        return ResponseHandler.notFound(res, 'Nenhum endereço principal encontrado');
      }

      return ResponseHandler.success(res, address);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereços por CEP
   */
  async getAddressesByCEP(req, res, next) {
    try {
      const { cep } = req.params;

      ValidationUtils.required(cep, 'CEP');
      ValidationUtils.cep(cep);

      const addresses = await this.Address.findAll({
        where: { cep },
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, addresses);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereços por cidade
   */
  async getAddressesByCity(req, res, next) {
    try {
      const { cidade } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      ValidationUtils.required(cidade, 'Cidade');

      const { count, rows } = await this.Address.findAndCountAll({
        where: { 
          cidade: { [connection.Sequelize.Op.iLike]: `%${cidade}%` }
        },
        limit,
        offset,
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereços por UF
   */
  async getAddressesByState(req, res, next) {
    try {
      const { uf } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      ValidationUtils.required(uf, 'UF');
      ValidationUtils.uf(uf);

      const { count, rows } = await this.Address.findAndCountAll({
        where: { uf: uf.toUpperCase() },
        limit,
        offset,
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter estatísticas de endereços
   */
  async getAddressStats(req, res, next) {
    try {
      const [
        totalAddresses,
        deliveryAddresses,
        billingAddresses,
        mainAddresses,
        addressesByState
      ] = await Promise.all([
        this.Address.count(),
        this.Address.count({ where: { tipo: 'entrega' } }),
        this.Address.count({ where: { tipo: 'cobranca' } }),
        this.Address.count({ where: { principal: true } }),
        this.Address.findAll({
          attributes: [
            'uf',
            [connection.Sequelize.fn('COUNT', connection.Sequelize.col('id')), 'count']
          ],
          group: ['uf'],
          order: [[connection.Sequelize.fn('COUNT', connection.Sequelize.col('id')), 'DESC']]
        })
      ]);

      const stats = {
        total: totalAddresses,
        byType: {
          entrega: deliveryAddresses,
          cobranca: billingAddresses
        },
        principais: mainAddresses,
        porEstado: addressesByState
      };

      return ResponseHandler.success(res, stats);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar CEP
   */
  async validateCEP(req, res, next) {
    try {
      const { cep } = req.params;

      ValidationUtils.required(cep, 'CEP');
      ValidationUtils.cep(cep);

      // Aqui você pode integrar com uma API de CEP como ViaCEP
      // Por enquanto, apenas retornamos que o formato é válido
      const isValid = /^\d{5}-?\d{3}$/.test(cep);

      return ResponseHandler.success(res, {
        cep,
        isValid,
        message: isValid ? 'CEP válido' : 'CEP inválido'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar endereços por tipo
   */
  async getAddressesByType(req, res, next) {
    try {
      const { tipo } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      ValidationUtils.required(tipo, 'Tipo');

      const validTypes = ['entrega', 'cobranca'];
      if (!validTypes.includes(tipo)) {
        return ResponseHandler.badRequest(res, 'Tipo inválido');
      }

      const { count, rows } = await this.Address.findAndCountAll({
        where: { tipo },
        limit,
        offset,
        include: [
          {
            model: this.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }
}

export default AddressController;
