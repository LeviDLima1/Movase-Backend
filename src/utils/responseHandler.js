/**
 * RESPONSE HANDLER - Sistema de Respostas Padronizadas
 * 
 * Este módulo fornece métodos padronizados para respostas da API.
 * Segue as melhores práticas REST e facilita o tratamento de erros.
 */

class ResponseHandler {
  /**
   * Resposta de sucesso (200)
   */
  static success(res, data = null, message = 'Operação realizada com sucesso') {
    return res.status(200).json({
      success: true,
      status: 200,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Recurso criado (201)
   */
  static created(res, data = null, message = 'Recurso criado com sucesso') {
    return res.status(201).json({
      success: true,
      status: 201,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sem conteúdo (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Erro de validação (400)
   */
  static badRequest(res, message = 'Dados inválidos', errors = null) {
    return res.status(400).json({
      success: false,
      status: 400,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Não autorizado (401)
   */
  static unauthorized(res, message = 'Acesso não autorizado') {
    return res.status(401).json({
      success: false,
      status: 401,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Proibido (403)
   */
  static forbidden(res, message = 'Acesso proibido') {
    return res.status(403).json({
      success: false,
      status: 403,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Não encontrado (404)
   */
  static notFound(res, message = 'Recurso não encontrado') {
    return res.status(404).json({
      success: false,
      status: 404,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Conflito (409)
   */
  static conflict(res, message = 'Conflito de dados') {
    return res.status(409).json({
      success: false,
      status: 409,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Erro de validação semântica (422)
   */
  static unprocessableEntity(res, message = 'Dados não podem ser processados', errors = null) {
    return res.status(422).json({
      success: false,
      status: 422,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Erro interno do servidor (500)
   */
  static internalServerError(res, message = 'Erro interno do servidor', error = null) {
    return res.status(500).json({
      success: false,
      status: 500,
      message,
      error: process.env.NODE_ENV === 'development' ? error : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Timeout (408)
   */
  static timeout(res, message = 'Tempo limite da requisição excedido') {
    return res.status(408).json({
      success: false,
      status: 408,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Muitas requisições (429)
   */
  static tooManyRequests(res, message = 'Muitas requisições') {
    return res.status(429).json({
      success: false,
      status: 429,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Resposta paginada
   */
  static paginated(res, data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      status: 200,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      timestamp: new Date().toISOString()
    });
  }
}

export default ResponseHandler;
