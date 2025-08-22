/**
 * TESTE COMPLETO DO SISTEMA DE EMAIL
 * 
 * Este script testa todo o fluxo:
 * 1. Login para obter token JWT
 * 2. Testar conexão SMTP
 * 3. Enviar email de teste
 * 4. Verificar estatísticas
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
let authToken = null;

// ===== FUNÇÕES AUXILIARES =====

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (authToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    console.log(`🌐 ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message);
    throw error;
  }
}

// ===== TESTE 1: LOGIN E OBTER TOKEN =====

async function testLogin() {
  console.log('\n🔐 === TESTE 1: LOGIN E OBTER TOKEN ===');
  
  try {
    const { data } = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@movase.com',
        password: 'admin123'
      })
    });

    if (data.success && data.data.token) {
      authToken = data.data.token;
      console.log('✅ Login realizado com sucesso!');
      console.log(`🔑 Token obtido: ${authToken.substring(0, 50)}...`);
      return true;
    } else {
      console.log('❌ Falha no login:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

// ===== TESTE 2: VERIFICAR CONEXÃO SMTP =====

async function testSMTPConnection() {
  console.log('\n🔌 === TESTE 2: VERIFICAR CONEXÃO SMTP ===');
  
  try {
    const { data } = await makeRequest('/email/test-connection');
    
    if (data.success) {
      console.log('✅ Conexão SMTP OK!');
      return true;
    } else {
      console.log('❌ Falha na conexão SMTP:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar SMTP:', error.message);
    return false;
  }
}

// ===== TESTE 3: LISTAR TEMPLATES =====

async function listTemplates() {
  console.log('\n📋 === TESTE 3: LISTAR TEMPLATES ===');
  
  try {
    const { data } = await makeRequest('/email/templates');
    
    if (data.success) {
      console.log('✅ Templates disponíveis:');
      data.message.forEach(template => {
        console.log(`  📧 ${template.name}: ${template.description}`);
      });
      return data.message;
    } else {
      console.log('❌ Falha ao listar templates:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao listar templates:', error.message);
    return [];
  }
}

// ===== TESTE 4: ENVIAR EMAIL DE TESTE =====

async function sendTestEmail(email, template = 'welcome') {
  console.log(`\n📧 === TESTE 4: ENVIAR EMAIL DE TESTE ===`);
  console.log(`📮 Para: ${email}`);
  console.log(`📄 Template: ${template}`);
  
  try {
    const { data } = await makeRequest('/email/send-test', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        template: template,
        context: {
          name: 'Usuário de Teste',
          message: 'Este é um email de teste do sistema Movase!',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (data.success) {
      console.log('✅ Email de teste enviado com sucesso!');
      return true;
    } else {
      console.log('❌ Falha ao enviar email:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    return false;
  }
}

// ===== TESTE 5: VERIFICAR ESTATÍSTICAS =====

async function checkEmailStats() {
  console.log('\n📊 === TESTE 5: VERIFICAR ESTATÍSTICAS ===');
  
  try {
    const { data } = await makeRequest('/email/stats');
    
    if (data.success) {
      console.log('✅ Estatísticas do serviço de email:');
      console.log(`  📤 Enviados: ${data.data.sent}`);
      console.log(`  ❌ Falharam: ${data.data.failed}`);
      console.log(`  ⏳ Na fila: ${data.data.queued}`);
      console.log(`  🔄 Processando: ${data.data.isProcessing}`);
      console.log(`  ✅ Inicializado: ${data.data.isInitialized}`);
      return data.data;
    } else {
      console.log('❌ Falha ao obter estatísticas:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.message);
    return null;
  }
}

// ===== TESTE 6: ENVIAR EMAIL DE RECUPERAÇÃO DE SENHA =====

async function sendPasswordResetEmail(email) {
  console.log(`\n🔑 === TESTE 6: ENVIAR EMAIL DE RECUPERAÇÃO ===`);
  console.log(`📮 Para: ${email}`);
  
  try {
    const { data } = await makeRequest('/email/password-reset', {
      method: 'POST',
      body: JSON.stringify({
        email: email
      })
    });

    if (data.success) {
      console.log('✅ Email de recuperação enviado com sucesso!');
      return true;
    } else {
      console.log('❌ Falha ao enviar email de recuperação:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email de recuperação:', error.message);
    return false;
  }
}

// ===== FUNÇÃO PRINCIPAL =====

async function runAllTests() {
  console.log('🚀 === INICIANDO TESTES COMPLETOS DO SISTEMA DE EMAIL ===\n');
  
  // Verificar se o servidor está rodando
  try {
    const response = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    if (!response.ok) {
      console.log('❌ Servidor não está rodando! Execute: npm run dev');
      return;
    }
    console.log('✅ Servidor está rodando!');
  } catch (error) {
    console.log('❌ Servidor não está rodando! Execute: npm run dev');
    return;
  }

  // Executar testes em sequência
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Falha no login. Verifique as credenciais do admin.');
    return;
  }

  const smtpSuccess = await testSMTPConnection();
  if (!smtpSuccess) {
    console.log('❌ Falha na conexão SMTP. Verifique as configurações no .env');
    return;
  }

  const templates = await listTemplates();
  if (templates.length === 0) {
    console.log('❌ Nenhum template encontrado.');
    return;
  }

  // Testar envio de email com o primeiro template
  const emailTest = await sendTestEmail('duartelevi02@gmail.com', 'welcome');
  
  // Aguardar um pouco para o email ser processado
  if (emailTest) {
    console.log('⏳ Aguardando 3 segundos para processamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await checkEmailStats();
  }

  // Testar email de recuperação de senha
  await sendPasswordResetEmail('duartelevi02@gmail.com');

  console.log('\n🎉 === TESTES CONCLUÍDOS ===');
  console.log('📧 Verifique sua caixa de entrada em: duartelevi02@gmail.com');
}

// ===== EXECUTAR TESTES =====

runAllTests().catch(error => {
  console.error('❌ Erro geral nos testes:', error);
  process.exit(1);
});
