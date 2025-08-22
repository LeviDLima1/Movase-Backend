import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

// Dados do usuário
const testUser = {
  email: 'duartelevi1@gmail.com',
  senha: '123123123'
};

async function testCheckout() {
  console.log('🛒 Testando sistema de checkout...\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error(`Erro no login: ${loginData.message}`);
    }

    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    console.log(`✅ Login realizado - User ID: ${userId}`);

    // 2. Verificar carrinho
    console.log('\n2️⃣ Verificando carrinho...');
    const cartResponse = await fetch(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const cartData = await cartResponse.json();
    console.log('📦 Carrinho:', {
      success: cartData.success,
      itemCount: cartData.data?.data?.cart?.items?.length || 0
    });

    if (!cartData.data?.data?.cart?.items?.length) {
      console.log('❌ Carrinho vazio. Adicionando item...');
      
      // Adicionar item ao carrinho
      const addResponse = await fetch(`${BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: 1,
          quantity: 1
        })
      });

      const addData = await addResponse.json();
      console.log('➕ Item adicionado:', addData.success);
    }

    // 3. Criar endereço de teste
    console.log('\n3️⃣ Criando endereço de teste...');
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

    const addressId = addressData.data.data.id;

    // 4. Criar compra
    console.log('\n4️⃣ Criando compra...');
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

    const purchaseResponse = await fetch(`${BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(purchaseData)
    });

    const purchaseResult = await purchaseResponse.json();
    console.log('🛒 Compra criada:', {
      success: purchaseResult.success,
      message: purchaseResult.message,
      purchaseId: purchaseResult.data?.data?.id
    });

    if (purchaseResult.success) {
      console.log('✅ CHECKOUT FUNCIONANDO!');
      console.log(`📋 ID da compra: ${purchaseResult.data.data.id}`);
      console.log(`💰 Total: R$ ${purchaseResult.data.data.total}`);
      console.log(`📦 Status: ${purchaseResult.data.data.status}`);
    } else {
      console.log('❌ Erro no checkout:', purchaseResult.message);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testCheckout();
