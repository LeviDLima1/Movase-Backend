/**
 * USER CONTROLLER - Controller de Gerenciamento de Usuários
 * 
 * Gerencia operações CRUD e funcionalidades administrativas
 * para usuários do sistema.
 */

import BaseController from './BaseController.js';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import connection from '../database/connection.js';

class UserController extends BaseController {
  constructor() {
    super(connection.models.User, 'Usuário');
    this.User = connection.models.User;
    this.Address = connection.models.Address;
    this.Purchases = connection.models.Purchases;
  }

  /**
   * Listar usuários com filtros avançados
   */
  async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const {
        search,
        role,
        status,
        emailVerificado,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // Construir condições WHERE
      const where = {};
      
      if (search) {
        where[connection.Sequelize.Op.or] = [
          { name: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { email: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { telefone: { [connection.Sequelize.Op.iLike]: `%${search}%` } },
          { CPF: { [connection.Sequelize.Op.iLike]: `%${search}%` } }
        ];
      }

      if (role) where.role = role;
      if (status) where.status = status;
      if (emailVerificado !== undefined) where.emailVerificado = emailVerificado === 'true';

      // Opções de consulta
      const options = {
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        attributes: { exclude: ['password'] }
      };

      // Incluir relacionamentos se solicitado
      if (req.query.include) {
        const includes = req.query.include.split(',');
        options.include = [];

        if (includes.includes('addresses')) {
          options.include.push({
            model: this.Address,
            as: 'addresses',
            attributes: ['id', 'cep', 'logradouro', 'numero', 'cidade', 'uf', 'tipo', 'principal']
          });
        }

        if (includes.includes('purchases')) {
          options.include.push({
            model: this.Purchases,
            as: 'purchases',
            attributes: ['id', 'numero', 'status', 'total', 'createdAt']
          });
        }
      }

      const { count, rows } = await this.User.findAndCountAll(options);

      return ResponseHandler.paginated(res, rows, page, limit, count);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar usuário por ID com relacionamentos
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const options = {
        where: { id },
        attributes: { exclude: ['password'] }
      };

      // Incluir relacionamentos se solicitado
      if (req.query.include) {
        const includes = req.query.include.split(',');
        options.include = [];

        if (includes.includes('addresses')) {
          options.include.push({
            model: this.Address,
            as: 'addresses',
            attributes: ['id', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'tipo', 'principal', 'ativo']
          });
        }

        if (includes.includes('purchases')) {
          options.include.push({
            model: this.Purchases,
            as: 'purchases',
            attributes: ['id', 'numero', 'status', 'subtotal', 'frete', 'desconto', 'total', 'formaPagamento', 'createdAt']
          });
        }
      }

      const user = await this.User.findOne(options);

      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      return ResponseHandler.success(res, user);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Criar usuário (admin)
   */
  async createUser(req, res, next) {
    try {
      const {
        name,
        email,
        telefone,
        CPF,
        password,
        role = 'user',
        status = 'ativo',
        dataNascimento,
        genero,
        emailVerificado = false,
        telefoneVerificado = false,
        aceiteNewsletter = false,
        aceiteTermos = true,
        aceitePrivacidade = true
      } = req.body;

      // Validações obrigatórias
      ValidationUtils.required(name, 'Nome');
      ValidationUtils.required(email, 'Email');
      ValidationUtils.required(telefone, 'Telefone');
      ValidationUtils.required(CPF, 'CPF');
      ValidationUtils.required(password, 'Senha');

      // Validações de formato
      ValidationUtils.email(email);
      ValidationUtils.phone(telefone);
      ValidationUtils.cpf(CPF);
      ValidationUtils.password(password);

      // Verificar unicidade
      const existingEmail = await this.User.findOne({ where: { email } });
      if (existingEmail) {
        return ResponseHandler.conflict(res, 'Email já cadastrado');
      }

      const existingPhone = await this.User.findOne({ where: { telefone } });
      if (existingPhone) {
        return ResponseHandler.conflict(res, 'Telefone já cadastrado');
      }

      const existingCPF = await this.User.findOne({ where: { CPF } });
      if (existingCPF) {
        return ResponseHandler.conflict(res, 'CPF já cadastrado');
      }

      // Criptografar senha
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Criar usuário
      const user = await this.User.create({
        name,
        email,
        telefone,
        CPF,
        password: hashedPassword,
        role,
        status,
        dataNascimento,
        genero,
        emailVerificado,
        telefoneVerificado,
        aceiteNewsletter,
        aceiteTermos,
        aceitePrivacidade
      });

      // Remover senha da resposta
      const userResponse = user.toJSON();
      delete userResponse.password;

      return ResponseHandler.created(res, userResponse, 'Usuário criado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar usuário (admin)
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const user = await this.User.findByPk(id);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Validações específicas para campos únicos
      if (updateData.email && updateData.email !== user.email) {
        ValidationUtils.email(updateData.email);
        const existingEmail = await this.User.findOne({
          where: { email: updateData.email, id: { [connection.Sequelize.Op.ne]: id } }
        });
        if (existingEmail) {
          return ResponseHandler.conflict(res, 'Email já cadastrado');
        }
      }

      if (updateData.telefone && updateData.telefone !== user.telefone) {
        ValidationUtils.phone(updateData.telefone);
        const existingPhone = await this.User.findOne({
          where: { telefone: updateData.telefone, id: { [connection.Sequelize.Op.ne]: id } }
        });
        if (existingPhone) {
          return ResponseHandler.conflict(res, 'Telefone já cadastrado');
        }
      }

      if (updateData.CPF && updateData.CPF !== user.CPF) {
        ValidationUtils.cpf(updateData.CPF);
        const existingCPF = await this.User.findOne({
          where: { CPF: updateData.CPF, id: { [connection.Sequelize.Op.ne]: id } }
        });
        if (existingCPF) {
          return ResponseHandler.conflict(res, 'CPF já cadastrado');
        }
      }

      // Se estiver atualizando a senha, criptografar
      if (updateData.password) {
        ValidationUtils.password(updateData.password);
        const bcrypt = await import('bcrypt');
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Atualizar usuário
      await user.update(updateData);

      // Remover senha da resposta
      const userResponse = user.toJSON();
      delete userResponse.password;

      return ResponseHandler.success(res, userResponse, 'Usuário atualizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar status do usuário
   */
  async changeUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.required(status, 'Status');
      ValidationUtils.isInteger(id, 'ID');

      const validStatuses = ['ativo', 'inativo', 'suspenso', 'pendente'];
      if (!validStatuses.includes(status)) {
        return ResponseHandler.badRequest(res, 'Status inválido');
      }

      const user = await this.User.findByPk(id);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Não permitir alterar status de admin
      if (user.role === 'admin' && req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Não é possível alterar status de administrador');
      }

      await user.update({ status, observacoes });

      const userResponse = user.toJSON();
      delete userResponse.password;

      return ResponseHandler.success(res, userResponse, `Status alterado para ${status}`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar role do usuário
   */
  async changeUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.required(role, 'Role');
      ValidationUtils.isInteger(id, 'ID');

      const validRoles = ['user', 'admin', 'moderator'];
      if (!validRoles.includes(role)) {
        return ResponseHandler.badRequest(res, 'Role inválida');
      }

      const user = await this.User.findByPk(id);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Apenas admin pode alterar roles
      if (req.user.role !== 'admin') {
        return ResponseHandler.forbidden(res, 'Apenas administradores podem alterar roles');
      }

      await user.update({ role });

      const userResponse = user.toJSON();
      delete userResponse.password;

      return ResponseHandler.success(res, userResponse, `Role alterada para ${role}`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar email do usuário
   */
  async verifyEmail(req, res, next) {
    try {
      const { id } = req.params;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const user = await this.User.findByPk(id);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      await user.update({
        emailVerificado: true,
        dataEmailVerificado: new Date()
      });

      return ResponseHandler.success(res, null, 'Email verificado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar telefone do usuário
   */
  async verifyPhone(req, res, next) {
    try {
      const { id } = req.params;

      ValidationUtils.required(id, 'ID');
      ValidationUtils.isInteger(id, 'ID');

      const user = await this.User.findByPk(id);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      await user.update({
        telefoneVerificado: true,
        dataTelefoneVerificado: new Date()
      });

      return ResponseHandler.success(res, null, 'Telefone verificado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Estatísticas de usuários
   */
  async getUserStats(req, res, next) {
    try {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        pendingUsers,
        verifiedEmails,
        verifiedPhones,
        recentUsers
      ] = await Promise.all([
        this.User.count(),
        this.User.count({ where: { status: 'ativo' } }),
        this.User.count({ where: { status: 'inativo' } }),
        this.User.count({ where: { status: 'suspenso' } }),
        this.User.count({ where: { status: 'pendente' } }),
        this.User.count({ where: { emailVerificado: true } }),
        this.User.count({ where: { telefoneVerificado: true } }),
        this.User.count({
          where: {
            createdAt: {
              [connection.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
            }
          }
        })
      ]);

      const stats = {
        total: totalUsers,
        byStatus: {
          ativo: activeUsers,
          inativo: inactiveUsers,
          suspenso: suspendedUsers,
          pendente: pendingUsers
        },
        verified: {
          email: verifiedEmails,
          phone: verifiedPhones
        },
        recent: recentUsers
      };

      return ResponseHandler.success(res, stats);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar usuários por critérios específicos
   */
  async searchUsers(req, res, next) {
    try {
      const { criteria } = req.body;

      if (!criteria || Object.keys(criteria).length === 0) {
        return ResponseHandler.badRequest(res, 'Critérios de busca não fornecidos');
      }

      const users = await this.User.findAll({
        where: criteria,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      return ResponseHandler.success(res, users);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Exportar dados de usuários
   */
  async exportUsers(req, res, next) {
    try {
      const { format = 'json', filters } = req.query;

      const where = filters ? JSON.parse(filters) : {};

      const users = await this.User.findAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      if (format === 'csv') {
        // TODO: Implementar exportação CSV
        return ResponseHandler.success(res, users, 'Exportação CSV em desenvolvimento');
      }

      return ResponseHandler.success(res, users);

    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
