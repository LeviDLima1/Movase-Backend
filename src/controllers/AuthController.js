/**
 * AUTH CONTROLLER - Controller de Autenticação
 * 
 * Gerencia autenticação, registro, login e gerenciamento de tokens JWT
 * para o sistema de usuários.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ResponseHandler from '../utils/responseHandler.js';
import ValidationUtils from '../utils/validation.js';
import connection from '../database/connection.js';

// Importar modelo User
import '../model/User.js';

class AuthController {
  constructor() {
    this.User = connection.models.User;
    this.jwtSecret = process.env.JWT_SECRET || 'movase-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Registrar novo usuário
   */
  async register(req, res, next) {
    try {
      const {
        name,
        nome,
        email,
        telefone,
        CPF,
        cpf,
        password,
        senha,
        dataNascimento,
        genero,
        aceiteNewsletter = false,
        aceiteTermos = false,
        aceitePrivacidade = false
      } = req.body;

      // Aceitar tanto 'name' quanto 'nome'
      const userName = name || nome;
      // Aceitar tanto 'password' quanto 'senha'
      const userPassword = password || senha;
      // Aceitar tanto 'CPF' quanto 'cpf'
      const userCPF = CPF || cpf;

      // Validações obrigatórias
      ValidationUtils.required(userName, 'Nome');
      ValidationUtils.required(email, 'Email');
      ValidationUtils.required(telefone, 'Telefone');
      ValidationUtils.required(userCPF, 'CPF');
      ValidationUtils.required(userPassword, 'Senha');
      ValidationUtils.required(aceiteTermos, 'Aceite dos Termos');
      ValidationUtils.required(aceitePrivacidade, 'Aceite da Privacidade');

      // Validações de formato
      ValidationUtils.email(email);
      ValidationUtils.phone(telefone);
      ValidationUtils.cpf(userCPF);
      ValidationUtils.password(userPassword);

      // Verificar se email já existe
      const existingEmail = await this.User.findOne({ where: { email } });
      if (existingEmail) {
        return ResponseHandler.conflict(res, 'Email já cadastrado');
      }

      // Verificar se telefone já existe
      const existingPhone = await this.User.findOne({ where: { telefone } });
      if (existingPhone) {
        return ResponseHandler.conflict(res, 'Telefone já cadastrado');
      }

      // Verificar se CPF já existe
      const existingCPF = await this.User.findOne({ where: { CPF: userCPF } });
      if (existingCPF) {
        return ResponseHandler.conflict(res, 'CPF já cadastrado');
      }

      // Criptografar senha
      const hashedPassword = await bcrypt.hash(userPassword, 12);

      // Criar usuário
      const user = await this.User.create({
        name: userName,
        email,
        telefone,
        CPF: userCPF,
        password: hashedPassword,
        dataNascimento,
        genero,
        aceiteNewsletter,
        aceiteTermos,
        aceitePrivacidade,
        role: 'user',
        status: 'ativo'
      });

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      // Remover senha da resposta e mapear campos para português
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      // Mapear campos para português
      const userResponsePT = {
        ...userResponse,
        nome: userResponse.name,
        cpf: userResponse.CPF
      };
      delete userResponsePT.name;
      delete userResponsePT.CPF;

      return ResponseHandler.created(res, {
        user: userResponsePT,
        token
      }, 'Usuário registrado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Login de usuário
   */
  async login(req, res, next) {
    try {
      const { email, password, senha } = req.body;
      
      // Aceitar tanto 'password' quanto 'senha'
      const userPassword = password || senha;

      // Validações
      ValidationUtils.required(email, 'Email');
      ValidationUtils.required(userPassword, 'Senha');
      ValidationUtils.email(email);

      // Buscar usuário
      const user = await this.User.findOne({ 
        where: { email },
        attributes: ['id', 'name', 'email', 'password', 'role', 'status', 'emailVerificado']
      });

      if (!user) {
        return ResponseHandler.unauthorized(res, 'Email ou senha inválidos');
      }

      // Verificar status
      if (user.status !== 'ativo') {
        return ResponseHandler.forbidden(res, 'Conta não está ativa');
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(userPassword, user.password);
      if (!isValidPassword) {
        return ResponseHandler.unauthorized(res, 'Email ou senha inválidos');
      }

      // Atualizar último acesso
      await user.update({
        ultimoAcesso: new Date(),
        ipUltimoAcesso: req.ip
      });

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      // Remover senha da resposta e mapear campos para português
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      // Mapear campos para português
      const userResponsePT = {
        ...userResponse,
        nome: userResponse.name,
        cpf: userResponse.CPF
      };
      delete userResponsePT.name;
      delete userResponsePT.CPF;

      return ResponseHandler.success(res, {
        user: userResponsePT,
        token
      }, 'Login realizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token e retornar dados do usuário
   */
  async me(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await this.User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Mapear campos para português
      const userResponse = user.toJSON();
      const userResponsePT = {
        ...userResponse,
        nome: userResponse.name,
        cpf: userResponse.CPF
      };
      delete userResponsePT.name;
      delete userResponsePT.CPF;

      return ResponseHandler.success(res, userResponsePT);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        name,
        telefone,
        dataNascimento,
        genero,
        avatar,
        aceiteNewsletter
      } = req.body;

      const user = await this.User.findByPk(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Validar telefone se fornecido
      if (telefone && telefone !== user.telefone) {
        ValidationUtils.phone(telefone);
        
        // Verificar se telefone já existe
        const existingPhone = await this.User.findOne({ 
          where: { telefone, id: { [connection.Sequelize.Op.ne]: userId } }
        });
        if (existingPhone) {
          return ResponseHandler.conflict(res, 'Telefone já cadastrado');
        }
      }

      // Atualizar dados
      const updateData = {};
      if (name) updateData.name = name;
      if (telefone) updateData.telefone = telefone;
      if (dataNascimento) updateData.dataNascimento = dataNascimento;
      if (genero) updateData.genero = genero;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (aceiteNewsletter !== undefined) updateData.aceiteNewsletter = aceiteNewsletter;

      await user.update(updateData);

      // Remover senha da resposta e mapear campos para português
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      // Mapear campos para português
      const userResponsePT = {
        ...userResponse,
        nome: userResponse.name,
        cpf: userResponse.CPF
      };
      delete userResponsePT.name;
      delete userResponsePT.CPF;

      return ResponseHandler.success(res, userResponsePT, 'Perfil atualizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validações
      ValidationUtils.required(currentPassword, 'Senha atual');
      ValidationUtils.required(newPassword, 'Nova senha');
      ValidationUtils.password(newPassword);

      const user = await this.User.findByPk(userId);
      if (!user) {
        return ResponseHandler.notFound(res, 'Usuário não encontrado');
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return ResponseHandler.badRequest(res, 'Senha atual incorreta');
      }

      // Criptografar nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha
      await user.update({ password: hashedNewPassword });

      return ResponseHandler.success(res, null, 'Senha alterada com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Solicitar recuperação de senha
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      ValidationUtils.required(email, 'Email');
      ValidationUtils.email(email);

      const user = await this.User.findOne({ where: { email } });
      if (!user) {
        // Por segurança, não informar se o email existe ou não
        return ResponseHandler.success(res, null, 'Se o email existir, você receberá as instruções');
      }

      // Gerar token de recuperação
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // Salvar token no banco
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hora
      });

      // TODO: Enviar email com link de recuperação
      console.log('Token de recuperação:', resetToken);

      return ResponseHandler.success(res, null, 'Se o email existir, você receberá as instruções');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Resetar senha com token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      ValidationUtils.required(token, 'Token');
      ValidationUtils.required(newPassword, 'Nova senha');
      ValidationUtils.password(newPassword);

      // Verificar token
      const decoded = jwt.verify(token, this.jwtSecret);
      
      const user = await this.User.findOne({
        where: {
          id: decoded.id,
          resetPasswordToken: token,
          resetPasswordExpires: { [connection.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return ResponseHandler.badRequest(res, 'Token inválido ou expirado');
      }

      // Criptografar nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha e limpar token
      await user.update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      return ResponseHandler.success(res, null, 'Senha redefinida com sucesso');

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return ResponseHandler.badRequest(res, 'Token inválido');
      }
      if (error.name === 'TokenExpiredError') {
        return ResponseHandler.badRequest(res, 'Token expirado');
      }
      next(error);
    }
  }

  /**
   * Logout (invalidar token)
   */
  async logout(req, res, next) {
    try {
      // Em uma implementação mais robusta, você pode adicionar o token
      // a uma blacklist ou usar refresh tokens
      
      return ResponseHandler.success(res, null, 'Logout realizado com sucesso');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar se email está disponível
   */
  async checkEmail(req, res, next) {
    try {
      const { email } = req.params;

      ValidationUtils.required(email, 'Email');
      ValidationUtils.email(email);

      const user = await this.User.findOne({ where: { email } });

      return ResponseHandler.success(res, {
        available: !user,
        email
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar se telefone está disponível
   */
  async checkPhone(req, res, next) {
    try {
      const { telefone } = req.params;

      ValidationUtils.required(telefone, 'Telefone');
      ValidationUtils.phone(telefone);

      const user = await this.User.findOne({ where: { telefone } });

      return ResponseHandler.success(res, {
        available: !user,
        telefone
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar se CPF está disponível
   */
  async checkCPF(req, res, next) {
    try {
      const { CPF } = req.params;

      ValidationUtils.required(CPF, 'CPF');
      ValidationUtils.cpf(CPF);

      const user = await this.User.findOne({ where: { CPF } });

      return ResponseHandler.success(res, {
        available: !user,
        CPF
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar email do usuário (admin)
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
   * Verificar telefone do usuário (admin)
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
}

export default AuthController;
