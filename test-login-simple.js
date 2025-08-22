import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testLoginSimple() {
  console.log('🔐 Testando login simples...\n');

  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'duartelevi1@gmail.com',
        senha: '123123123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('📋 Resposta do login:', JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.log('❌ Erro no login:', loginData.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testLoginSimple();
