/**
 * TESTE DO SISTEMA DE EMAIL
 * 
 * Script para testar o envio de emails
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testEmailSystem() {
  console.log('🧪 Testando Sistema de Email...\n');

  try {
    // 1. Testar conexão SMTP
    console.log('1️⃣ Testando conexão SMTP...');
    const connectionTest = await fetch(`${API_BASE}/email/test-connection`);
    const connectionResult = await connectionTest.json();
    console.log('Resultado:', connectionResult);

    // 2. Listar templates
    console.log('\n2️⃣ Listando templates disponíveis...');
    const templatesTest = await fetch(`${API_BASE}/email/templates`);
    const templatesResult = await templatesTest.json();
    console.log('Templates:', templatesResult);

    // 3. Fazer login para obter token
    console.log('\n3️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@movase.com',
        password: 'admin123'
      })
    });
    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.error('❌ Erro no login:', loginResult);
      return;
    }

    const token = loginResult.data.token;
    console.log('✅ Login realizado com sucesso');

    // 4. Enviar email de teste
    console.log('\n4️⃣ Enviando email de teste...');
    const emailResponse = await fetch(`${API_BASE}/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'duartelevi02@gmail.com', // Seu email
        template: 'welcome',
        context: {
          name: 'Duarte Levi',
          message: 'Este é um teste do sistema de email do Movase!'
        }
      })
    });
    
    const emailResult = await emailResponse.json();
    console.log('Resultado do envio:', emailResult);

    // 5. Verificar estatísticas
    console.log('\n5️⃣ Verificando estatísticas...');
    const statsResponse = await fetch(`${API_BASE}/email/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsResult = await statsResponse.json();
    console.log('Estatísticas:', statsResult);

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste
testEmailSystem();
