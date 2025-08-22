import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testAddressDetailed() {
  console.log('📍 Testando criação de endereço (detalhado)...\n');

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'duartelevi1@gmail.com',
        senha: '123123123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login realizado');

    // 2. Criar endereço com dados corretos
    const addressData = {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      tipo: 'entrega'
    };

    console.log('📝 Dados do endereço:', JSON.stringify(addressData, null, 2));

    const addressResponse = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    console.log('📋 Status da resposta:', addressResponse.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(addressResponse.headers.entries()));

    const addressResult = await addressResponse.json();
    console.log('📋 Resposta completa:', JSON.stringify(addressResult, null, 2));

    if (addressResult.success) {
      console.log('✅ Endereço criado com sucesso!');
      console.log('📋 ID do endereço:', addressResult.data?.data?.id);
    } else {
      console.log('❌ Erro ao criar endereço:');
      console.log('   - Mensagem:', addressResult.message);
      console.log('   - Status:', addressResult.status);
      console.log('   - Erro:', addressResult.error);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testAddressDetailed();
