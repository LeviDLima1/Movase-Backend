import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testAddress() {
  console.log('📍 Testando criação de endereço...\n');

  try {
    // 1. Login
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

    // 2. Criar endereço
    const addressData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      tipo: 'entrega'
    };

    console.log('📝 Dados do endereço:', addressData);

    const addressResponse = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    const addressResult = await addressResponse.json();
    console.log('📋 Resposta completa:', JSON.stringify(addressResult, null, 2));

    if (addressResult.success) {
      console.log('✅ Endereço criado com sucesso!');
    } else {
      console.log('❌ Erro ao criar endereço:', addressResult.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAddress();
