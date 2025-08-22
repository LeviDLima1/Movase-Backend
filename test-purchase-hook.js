import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';
import './src/model/Books.js';
import './src/model/Purchases.js';
import './src/model/PurchaseItems.js';

async function testPurchaseHook() {
  console.log('🛒 Testando hook do modelo Purchases...\n');

  try {
    const Purchases = connection.models.Purchases;
    const User = connection.models.User;
    const Address = connection.models.Address;
    const Books = connection.models.Books;

    // Verificar se o modelo existe
    console.log('📋 Modelo Purchases existe:', !!Purchases);
    console.log('📋 Hook beforeCreate existe:', !!Purchases.options.hooks.beforeCreate);

    // Buscar usuário e endereço existentes
    const user = await User.findByPk(2);
    const address = await Address.findByPk(6);
    const book = await Books.findByPk(1);

    console.log('👤 Usuário:', user ? `ID ${user.id}` : 'Não encontrado');
    console.log('📍 Endereço:', address ? `ID ${address.id}` : 'Não encontrado');
    console.log('📚 Livro:', book ? `ID ${book.id}` : 'Não encontrado');

    if (!user || !address || !book) {
      throw new Error('Dados necessários não encontrados');
    }

    // Testar criação direta
    console.log('\n🧪 Testando criação direta...');
    const purchaseData = {
      userId: user.id,
      addressId: address.id,
      subtotal: 35.00,
      frete: 15.00,
      desconto: 0,
      total: 50.00,
      formaPagamento: 'pix',
      parcelas: 1,
      observacoes: 'Teste de hook',
      status: 'pendente'
    };

    console.log('📋 Dados para criação:', JSON.stringify(purchaseData, null, 2));

    const purchase = await Purchases.create(purchaseData);
    
    console.log('✅ Compra criada com sucesso!');
    console.log('📋 ID:', purchase.id);
    console.log('📋 Número:', purchase.numero);
    console.log('📋 Total:', purchase.total);
    console.log('📋 Status:', purchase.status);

    // Limpar teste
    await purchase.destroy();
    console.log('🧹 Teste limpo');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

testPurchaseHook();
