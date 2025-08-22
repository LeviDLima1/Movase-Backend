import connection from './src/database/connection.js';
import './src/model/User.js';

async function testUserCheck() {
  console.log('👤 Verificando usuário no banco...\n');

  try {
    const User = connection.models.User;
    
    // Buscar usuário por email
    const user = await User.findOne({
      where: { email: 'duartelevi1@gmail.com' }
    });

    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('   - ID:', user.id);
      console.log('   - Nome:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Status:', user.status);
    } else {
      console.log('❌ Usuário não encontrado');
      
      // Criar usuário de teste
      console.log('\n➕ Criando usuário de teste...');
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.default.hash('123123123', 10);
      
      const newUser = await User.create({
        name: 'Levi Duarte Lima',
        email: 'duartelevi1@gmail.com',
        senha: hashedPassword,
        telefone: '11999999999',
        CPF: '12345678901',
        status: 'ativo',
        role: 'user'
      });
      
      console.log('✅ Usuário criado:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUserCheck();

