import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';
import AddressController from './src/controllers/AddressController.js';

console.log('🔍 Testando AddressController...\n');

// Verificar se os modelos estão disponíveis
console.log('📋 Modelos no connection:');
console.log(Object.keys(connection.models));

// Criar instância do controller
const addressController = new AddressController();

console.log('\n🔍 Propriedades do controller:');
console.log('this.Address:', addressController.Address ? '✅ Existe' : '❌ Não existe');
console.log('this.User:', addressController.User ? '✅ Existe' : '❌ Não existe');
console.log('this.model:', addressController.model ? '✅ Existe' : '❌ Não existe');

if (addressController.Address) {
  console.log('\n📋 Métodos do modelo Address:');
  console.log('create:', typeof addressController.Address.create);
  console.log('findAll:', typeof addressController.Address.findAll);
  console.log('findByPk:', typeof addressController.Address.findByPk);
}

// Testar criação direta
console.log('\n🧪 Testando criação direta...');
try {
  const testAddress = await connection.models.Address.create({
    userId: 2,
    cep: '01310100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 101',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    tipo: 'entrega'
  });
  console.log('✅ Criação direta funcionou!');
  console.log('ID:', testAddress.id);
} catch (error) {
  console.log('❌ Erro na criação direta:', error.message);
}
