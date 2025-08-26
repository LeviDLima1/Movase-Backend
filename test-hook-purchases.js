import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';
import './src/model/Books.js';
import './src/model/Purchases.js';
import './src/model/PurchaseItems.js';

async function testHookPurchases() {
  console.log('🧪 Testando hook beforeCreate do modelo Purchases...\n');

  try {
    // Sincronizar modelos
    await connection.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    // Criar dados de teste
    const timestamp = Date.now();
    const user = await connection.models.User.create({
      name: 'Teste Hook',
      email: `teste-hook-${timestamp}@example.com`,
      password: '123123123',
      CPF: `1234567890${timestamp % 100}`,
      telefone: `1199999999${timestamp % 100}`
    });
    console.log('✅ Usuário criado:', user.id);

    const address = await connection.models.Address.create({
      userId: user.id,
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      tipo: 'entrega'
    });
    console.log('✅ Endereço criado:', address.id);

    const book = await connection.models.Books.create({
      titulo: 'Livro Teste Hook',
      autor: 'Autor Teste',
      sinopse: 'Sinopse de teste',
      preco: 29.90,
      estoque: 10,
      categoria: 'teste',
      isbn: `123456789012${timestamp % 100}`
    });
    console.log('✅ Livro criado:', book.id);

    // Teste 1: Criar compra SEM número (deve gerar automaticamente)
    console.log('\n🔧 Teste 1: Criando compra SEM número...');
    const purchase1 = await connection.models.Purchases.create({
      userId: user.id,
      addressId: address.id,
      subtotal: 29.90,
      frete: 15.00,
      desconto: 0,
      total: 44.90,
      formaPagamento: 'pix',
      parcelas: 1,
      status: 'pendente'
    });

    console.log('📋 Compra 1 criada:');
    console.log('   - ID:', purchase1.id);
    console.log('   - Número:', purchase1.numero);
    console.log('   - Status:', purchase1.status);

    // Teste 2: Criar compra COM número (não deve sobrescrever)
    console.log('\n🔧 Teste 2: Criando compra COM número...');
    const purchase2 = await connection.models.Purchases.create({
      userId: user.id,
      addressId: address.id,
      numero: 'PED-TESTE-123',
      subtotal: 29.90,
      frete: 15.00,
      desconto: 0,
      total: 44.90,
      formaPagamento: 'pix',
      parcelas: 1,
      status: 'pendente'
    });

    console.log('📋 Compra 2 criada:');
    console.log('   - ID:', purchase2.id);
    console.log('   - Número:', purchase2.numero);
    console.log('   - Status:', purchase2.status);

    // Verificar se os números são únicos
    if (purchase1.numero !== purchase2.numero) {
      console.log('✅ Números são únicos - Hook funcionando!');
    } else {
      console.log('❌ Números são iguais - Problema no hook!');
    }

    // Listar todas as compras
    console.log('\n📋 Todas as compras criadas:');
    const allPurchases = await connection.models.Purchases.findAll({
      order: [['createdAt', 'DESC']]
    });

    allPurchases.forEach((purchase, index) => {
      console.log(`   ${index + 1}. ID: ${purchase.id}, Número: ${purchase.numero}, Status: ${purchase.status}`);
    });

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.close();
  }
}

testHookPurchases();
