import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testCheckoutSimple() {
  console.log('🛒 Testando checkout simples...\n');

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
    const userId = loginData.data.user.id;
    console.log(`✅ Login realizado - User ID: ${userId}`);

    // 2. Criar endereço
    console.log('\n2️⃣ Criando endereço...');
    const addressResponse = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        complemento: 'Apto 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        tipo: 'entrega'
      })
    });

    const addressData = await addressResponse.json();
    console.log('📍 Endereço criado:', addressData.success);
    
    if (!addressData.success) {
      throw new Error('Erro ao criar endereço');
    }

    const addressId = addressData.data.id;
    console.log(`📍 ID do endereço: ${addressId}`);

    // 3. Criar compra
    console.log('\n3️⃣ Criando compra...');
    const purchaseData = {
      userId: userId,
      addressId: addressId,
      items: [
        {
          bookId: 1,
          quantidade: 1,
          desconto: 0
        }
      ],
      formaPagamento: 'pix',
      parcelas: 1,
      observacoes: 'Teste de checkout',
      frete: 15.00
    };

    console.log('📋 Dados da compra:', JSON.stringify(purchaseData, null, 2));

    const purchaseResponse = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(purchaseData)
    });

    const purchaseResult = await purchaseResponse.json();
    console.log('🛒 Resultado da compra:', {
      success: purchaseResult.success,
      message: purchaseResult.message,
      status: purchaseResult.status
    });

    if (purchaseResult.success) {
      console.log('✅ CHECKOUT FUNCIONANDO!');
      console.log(`📋 ID da compra: ${purchaseResult.data?.data?.id}`);
      console.log(`💰 Total: R$ ${purchaseResult.data?.data?.total}`);
      console.log(`📦 Status: ${purchaseResult.data?.data?.status}`);
    } else {
      console.log('❌ Erro no checkout:', purchaseResult.message);
      console.log('📋 Erro detalhado:', purchaseResult.error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCheckoutSimple();
