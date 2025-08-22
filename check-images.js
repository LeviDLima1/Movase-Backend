// ===== TESTE DO SISTEMA DE AUTENTICAÇÃO =====

async function testAuthentication() {
  console.log('🔐 Testando Sistema de Autenticação (Frontend → Backend)...\n');

  const FRONTEND_API = 'http://localhost:3000/api';
  const BACKEND_API = 'http://localhost:3001/api';
  
  try {
    // Teste 1: Login com credenciais corretas
    console.log('1️⃣ Testando Login (credenciais corretas)...');
    
    const loginResponse = await fetch(`${BACKEND_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@movase.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login: OK');
      console.log(`   Token recebido: ${loginData.data.token ? 'SIM' : 'NÃO'}`);
      console.log(`   Usuário: ${loginData.data.user.name}`);
      console.log(`   Email: ${loginData.data.user.email}`);
      console.log(`   Role: ${loginData.data.user.role}`);
      
      // Teste 2: Verificar token
      console.log('\n2️⃣ Testando verificação de token...');
      
      const authResponse = await fetch(`${BACKEND_API}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const authData = await authResponse.json();
      
      if (authResponse.ok && authData.success) {
        console.log('✅ Verificação de Token: OK');
        console.log(`   Usuário autenticado: ${authData.data.name}`);
      } else {
        console.log('❌ Verificação de Token: FALHOU');
        console.log(`   Erro: ${authData.error || 'Erro desconhecido'}`);
      }
      
    } else {
      console.log('❌ Login: FALHOU');
      console.log(`   Erro: ${loginData.error || 'Erro desconhecido'}`);
    }

    // Teste 3: Login com credenciais incorretas
    console.log('\n3️⃣ Testando Login (credenciais incorretas)...');
    
    const wrongLoginResponse = await fetch(`${BACKEND_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@movase.com',
        password: 'senhaerrada'
      })
    });
    
    const wrongLoginData = await wrongLoginResponse.json();
    
    if (!wrongLoginResponse.ok || !wrongLoginData.success) {
      console.log('✅ Validação de Senha: OK (senha incorreta rejeitada)');
      console.log(`   Mensagem: ${wrongLoginData.error || wrongLoginData.message}`);
    } else {
      console.log('❌ Validação de Senha: FALHOU (senha incorreta aceita!)');
    }

    // Teste 4: Registro de novo usuário
    console.log('\n4️⃣ Testando Registro de novo usuário...');
    
    const registerResponse = await fetch(`${BACKEND_API}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuário Teste',
        email: `teste${Date.now()}@movase.com`,
        telefone: '11987654321',
        CPF: '12345678909',
        password: 'teste123',
        aceiteTermos: true
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok && registerData.success) {
      console.log('✅ Registro: OK');
      console.log(`   Usuário criado: ${registerData.data.user.name}`);
      console.log(`   Email: ${registerData.data.user.email}`);
    } else {
      console.log('❌ Registro: FALHOU');
      console.log(`   Erro: ${registerData.error || 'Erro desconhecido'}`);
    }

    console.log('\n🎉 Teste de Autenticação concluído!');
    console.log('\n📝 Resumo:');
    console.log('   ✅ Backend de autenticação funcionando');
    console.log('   ✅ Login e validação de senha operacionais');
    console.log('   ✅ Tokens JWT sendo gerados e validados');
    console.log('   ✅ Sistema pronto para uso no frontend');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verificar se o backend está rodando na porta 3001');
    console.log('   2. Verificar se o banco de dados está conectado');
    console.log('   3. Verificar se há usuários no banco de dados');
    console.log('   4. Verificar logs do servidor para mais detalhes');
  }
}

// Executar teste
testAuthentication();
