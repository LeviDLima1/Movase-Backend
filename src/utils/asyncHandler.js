/**
 * ASYNC HANDLER
 * 
 * Wrapper para funções assíncronas que captura erros automaticamente
 * e os passa para o middleware de tratamento de erros do Express.
 */

/**
 * Wrapper para funções assíncronas
 * @param {Function} fn - Função assíncrona a ser executada
 * @returns {Function} - Função middleware do Express
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
