import app from "./index.js";
import syncModels from "./database/syncModels.js";
import connection from "./database/connection.js";
import emailService from './services/emailService.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * INICIALIZAÇÃO DO SERVIDOR
 * 
 * Este arquivo inicializa o servidor e sincroniza os modelos
 * com o banco de dados.
 */

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Testar conexão com o banco
    console.log('🔌 Testando conexão com o banco de dados...');
    await connection.authenticate();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    // Sincronizar modelos
    console.log('🔄 Sincronizando modelos...');
    await syncModels();
    console.log('✅ Modelos sincronizados com sucesso!');

    // Inicializar serviço de email
    try {
      await emailService.initialize();
      console.log('✅ Serviço de email inicializado com sucesso');
    } catch (error) {
      console.warn('⚠️ Serviço de email não pôde ser inicializado:', error.message);
      console.log('💡 Configure as variáveis SMTP_* no arquivo .env para ativar o serviço de email');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🎉 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Banco: ${process.env.DB_NAME || 'movase_db'}`);
      console.log('✨ Pronto para receber requisições!');
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();
