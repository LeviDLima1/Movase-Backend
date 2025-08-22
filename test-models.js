import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';
import './src/model/Books.js';
import './src/model/Cart.js';
import './src/model/Purchases.js';
import './src/model/PurchaseItems.js';

console.log('🔍 Verificando modelos registrados...\n');

console.log('📋 Modelos disponíveis:');
console.log(Object.keys(connection.models));

console.log('\n🔍 Verificando modelo Address:');
console.log('Address model:', connection.models.Address ? '✅ Existe' : '❌ Não existe');

console.log('\n🔍 Verificando modelo User:');
console.log('User model:', connection.models.User ? '✅ Existe' : '❌ Não existe');

console.log('\n🔍 Verificando modelo Books:');
console.log('Books model:', connection.models.Books ? '✅ Existe' : '❌ Não existe');

if (connection.models.Address) {
  console.log('\n📋 Atributos do modelo Address:');
  console.log(Object.keys(connection.models.Address.rawAttributes));
}
