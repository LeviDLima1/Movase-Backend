/**
 * BASE CONTROLLER - Classe Base para Controllers
 * 
 * Esta classe fornece métodos comuns e padrões para todos os controllers
 * da aplicação, seguindo princípios DRY e boas práticas.
 */

import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import ErrorHandler from '../middleware/errorHandler.js';

class BaseController {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Listar todos os registros com paginação
   */
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Opções de consulta
      const options = {
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      };

      // Filtros dinâmicos
      if (req.query.search) {
        options.where = {
          [this.model.sequelize.Op.or]: [
            { name: { [this.model.sequelize.Op.iLike]: `%${req.query.search}%` } },
            { email: { [this.model.sequelize.Op.iLike]: `%${req.query.search}%` } }
          ]
        };
      }

      // Status filter
      if (req.query.status) {
        options.where = {
          ...options.where,
          status: req.query.status
        };
      }

      const { count, rows } = await this.model.findAndCountAll(options);

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar registro por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const record = await this.model.findByPk(id);

      if (!record) {
        return ResponseHandler.notFound(res, `${this.modelName} não encontrado`);
      }

      return ResponseHandler.success(res, record);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar novo registro
   */
  async create(req, res, next) {
    try {
      const data = req.body;

      // Validação básica
      if (!data || Object.keys(data).length === 0) {
        return ResponseHandler.badRequest(res, 'Dados não fornecidos');
      }

      const record = await this.model.create(data);

      return ResponseHandler.created(res, record, `${this.modelName} criado com sucesso`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar registro
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validar ID
      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      // Validar dados
      if (!data || Object.keys(data).length === 0) {
        return ResponseHandler.badRequest(res, 'Dados não fornecidos');
      }

      const record = await this.model.findByPk(id);

      if (!record) {
        return ResponseHandler.notFound(res, `${this.modelName} não encontrado`);
      }

      await record.update(data);

      return ResponseHandler.success(res, record, `${this.modelName} atualizado com sucesso`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletar registro
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Validar ID
      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const record = await this.model.findByPk(id);

      if (!record) {
        return ResponseHandler.notFound(res, `${this.modelName} não encontrado`);
      }

      await record.destroy();

      return ResponseHandler.success(res, null, `${this.modelName} deletado com sucesso`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar por critérios específicos
   */
  async findByCriteria(req, res, next) {
    try {
      const criteria = req.body;

      if (!criteria || Object.keys(criteria).length === 0) {
        return ResponseHandler.badRequest(res, 'Critérios de busca não fornecidos');
      }

      const records = await this.model.findAll({
        where: criteria,
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, records);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Contar registros
   */
  async count(req, res, next) {
    try {
      const where = req.query.where ? JSON.parse(req.query.where) : {};

      const count = await this.model.count({ where });

      return ResponseHandler.success(res, { count });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar com relacionamentos
   */
  async findWithAssociations(req, res, next) {
    try {
      const { id } = req.params;
      const { include } = req.query;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const options = {
        where: { id }
      };

      if (include) {
        options.include = include.split(',');
      }

      const record = await this.model.findOne(options);

      if (!record) {
        return ResponseHandler.notFound(res, `${this.modelName} não encontrado`);
      }

      return ResponseHandler.success(res, record);

    } catch (error) {
      next(error);
    }
  }
}

export default BaseController;
