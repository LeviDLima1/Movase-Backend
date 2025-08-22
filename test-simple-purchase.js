import connection from './src/database/connection.js';
import './src/model/User.js';
import './src/model/Address.js';

async function testSimplePurchase() {
  console.log('🛒 Testando modelo simplificado...\n');

  try {
    // Criar modelo simplificado
    const SimplePurchase = connection.define('SimplePurchase', {
      id: {
        type: connection.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: connection.Sequelize.INTEGER,
        allowNull: false
      },
      numero: {
        type: connection.Sequelize.STRING(50),
        allowNull: false
      },
      total: {
        type: connection.Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      tableName: 'simple_purchases',
      timestamps: true,
      hooks: {
        beforeCreate: (purchase) => {
          console.log('🔧 Hook beforeCreate executado');
          if (!purchase.numero) {
            const data = new Date();
            const timestamp = data.getTime();
            purchase.numero = `PED-${timestamp}`;
            console.log('📋 Número gerado:', purchase.numero);
          }
        }
      }
    });

    // Sincronizar
    await connection.sync({ force: true });
    console.log('✅ Modelo sincronizado');

    // Testar criação
    const purchase = await SimplePurchase.create({
      userId: 2,
      total: 50.00
    });

    console.log('✅ Compra criada:', {
      id: purchase.id,
      numero: purchase.numero,
      total: purchase.total
    });

    // Limpar
    await purchase.destroy();
    console.log('🧹 Teste limpo');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testSimplePurchase();
