import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';
import './src/model/Books.js';
import './src/model/Purchases.js';
import './src/model/PurchaseItems.js';
import { defineAssociations } from './src/model/associations.js';

async function testSyncCheck() {
  console.log('🔄 Testando sincronização dos modelos...\n');

  try {
    // Definir associações
    defineAssociations();
    
    // Verificar se os modelos estão disponíveis
    console.log('📋 Modelos disponíveis:');
    console.log(Object.keys(connection.models));

    // Verificar modelo Purchases
    const Purchases = connection.models.Purchases;
    console.log('\n🔍 Modelo Purchases:');
    console.log('   - Existe:', !!Purchases);
    console.log('   - Hook beforeCreate:', !!Purchases?.options?.hooks?.beforeCreate);
    console.log('   - Campos:', Object.keys(Purchases?.rawAttributes || {}));

    // Verificar campo numero
    const numeroField = Purchases?.rawAttributes?.numero;
    console.log('\n🔍 Campo numero:');
    console.log('   - Existe:', !!numeroField);
    console.log('   - allowNull:', numeroField?.allowNull);
    console.log('   - Type:', numeroField?.type);

    // Sincronizar modelos
    console.log('\n🔄 Sincronizando modelos...');
    await connection.sync({ alter: false, force: false });
    console.log('✅ Sincronização concluída');

    // Testar criação
    console.log('\n🧪 Testando criação...');
    const purchaseData = {
      userId: 2,
      addressId: 8,
      subtotal: 35.00,
      frete: 15.00,
      desconto: 0,
      total: 50.00,
      formaPagamento: 'pix',
      parcelas: 1,
      observacoes: 'Teste de sincronização',
      status: 'pendente'
    };

    const purchase = await Purchases.create(purchaseData);
    console.log('✅ Compra criada com sucesso!');
    console.log('   - ID:', purchase.id);
    console.log('   - Número:', purchase.numero);
    console.log('   - Total:', purchase.total);

    // Limpar
    await purchase.destroy();
    console.log('🧹 Teste limpo');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

testSyncCheck();
