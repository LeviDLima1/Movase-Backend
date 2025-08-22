// ===== TESTE SIMPLES DO SERVIDOR =====

import express from 'express';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = 3002; // Porta fixa para teste

// Rota de teste
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 200,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📱 Teste: http://localhost:${PORT}/test`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promise rejeitada:', error);
  process.exit(1);
});
