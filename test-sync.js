import dotenv from 'dotenv';
import syncModels from './src/database/syncModels.js';
import connection from './src/database/connection.js';
import User from './src/model/User.js';
import Books from './src/model/Books.js';
import Address from './src/model/Address.js';
import Purchases from './src/model/Purchases.js';
import PurchaseItems from './src/model/PurchaseItems.js';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * TESTE DE SINCRONIZAÇÃO
 * 
 * Este arquivo testa a sincronização dos modelos com o banco de dados
 * e cria alguns dados de exemplo para verificar se tudo está funcionando.
 */

async function testSync() {
  try {
    console.log('🧪 Iniciando teste de sincronização...\n');
    
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com o banco...');
    await connection.authenticate();
    console.log('✅ Conexão OK!\n');
    
    // 2. Sincronizar modelos
    console.log('2️⃣ Sincronizando modelos...');
    await syncModels();
    console.log('✅ Sincronização OK!\n');
    
    // 3. Verificar se as tabelas foram criadas
    console.log('3️⃣ Verificando tabelas criadas...');
    const tables = await connection.showAllSchemas();
    console.log('📋 Tabelas no banco:', tables.map(t => t.name).join(', '));
    console.log('✅ Tabelas verificadas!\n');
    
    // 4. Testar criação de dados
    console.log('4️⃣ Testando criação de dados...');
    
    // Criar usuário de teste
    const testUser = await User.create({
      name: 'João Silva',
      email: 'joao.teste@exemplo.com',
      password: '123456',
      telefone: '(11) 88888-8888',
      CPF: '98765432100',
      tipo: 'cliente'
    });
    console.log('👤 Usuário criado:', testUser.name);
    
    // Criar endereço de teste
    const testAddress = await Address.create({
      userId: testUser.id,
      cep: '01234567',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      tipo: 'entrega'
    });
    console.log('📍 Endereço criado:', testAddress.logradouro);
    
    // Criar livro de teste
    const testBook = await Books.create({
      titulo: 'O Poder da Fé',
      autor: 'João Batista',
      descricao: 'Um livro sobre fé e superação',
      sinopse: 'História inspiradora sobre fé',
      isbn: '978-85-123456-7-8',
      paginas: 200,
      ano: 2024,
      editora: 'Editora Movase',
      idioma: 'Português',
      formato: 'Físico',
      peso: 0.5,
      dimensoes: '16x23cm',
      categoria: 'Religioso',
      subcategoria: 'Fé',
      tags: ['fé', 'superação', 'cristianismo'],
      preco: 49.90,
      estoque: 10,
      status: 'ativo',
      destaque: true,
      novidade: true
    });
    console.log('📚 Livro criado:', testBook.titulo);
    
    // Criar pedido de teste
    const testPurchase = await Purchases.create({
      userId: testUser.id,
      addressId: testAddress.id,
      numero: 'PED-TEST-001',
      subtotal: 49.90,
      frete: 10.00,
      desconto: 0,
      total: 59.90,
      formaPagamento: 'pix',
      parcelas: 1,
      status: 'pendente'
    });
    console.log('🛒 Pedido criado:', testPurchase.numero);
    
    // Criar item do pedido
    const testItem = await PurchaseItems.create({
      purchaseId: testPurchase.id,
      bookId: testBook.id,
      quantidade: 1,
      precoUnitario: 49.90,
      precoTotal: 49.90,
      desconto: 0,
      precoFinal: 49.90,
      status: 'pendente'
    });
    console.log('📦 Item do pedido criado');
    
    // 5. Testar consultas relacionais
    console.log('\n5️⃣ Testando consultas relacionais...');
    
    // Buscar usuário com endereços
    const userWithAddresses = await User.findOne({
      where: { id: testUser.id },
      include: [{ model: Address, as: 'addresses' }]
    });
    console.log('👤 Usuário com endereços:', userWithAddresses.addresses.length, 'endereços');
    
    // Buscar pedido com itens e livros
    const purchaseWithItems = await Purchases.findOne({
      where: { id: testPurchase.id },
      include: [
        { model: User, as: 'user' },
        { model: Address, as: 'deliveryAddress' },
        { 
          model: PurchaseItems, 
          as: 'items',
          include: [{ model: Books, as: 'book' }]
        }
      ]
    });
    console.log('🛒 Pedido com itens:', purchaseWithItems.items.length, 'itens');
    console.log('📚 Livro no pedido:', purchaseWithItems.items[0].book.titulo);
    
    // 6. Limpar dados de teste
    console.log('\n6️⃣ Limpando dados de teste...');
    await PurchaseItems.destroy({ where: { id: testItem.id } });
    await Purchases.destroy({ where: { id: testPurchase.id } });
    await Books.destroy({ where: { id: testBook.id } });
    await Address.destroy({ where: { id: testAddress.id } });
    await User.destroy({ where: { id: testUser.id } });
    console.log('🧹 Dados de teste removidos');
    
    // 7. Fechar conexão
    await connection.close();
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('✅ Todos os modelos estão funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('📋 Detalhes:', error.message);
    
    // Tentar fechar conexão mesmo com erro
    try {
      await connection.close();
    } catch (closeError) {
      console.error('❌ Erro ao fechar conexão:', closeError.message);
    }
    
    process.exit(1);
  }
}

// Executar teste
testSync();
