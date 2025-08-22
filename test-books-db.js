import connection from './src/database/connection.js';
import './src/model/Books.js';

async function testBooksDB() {
  console.log('📚 Testando livros no banco de dados...\n');

  try {
    const Books = connection.models.Books;
    
    // Buscar todos os livros
    const books = await Books.findAll();
    console.log(`📚 Total de livros: ${books.length}`);
    
    books.forEach(book => {
      console.log(`   - ID: ${book.id}, Título: ${book.titulo}, Preço: R$ ${book.preco}, Estoque: ${book.estoque}`);
    });

    // Buscar livro específico
    console.log('\n🔍 Buscando livro ID 1...');
    const book = await Books.findByPk(1);
    
    if (book) {
      console.log('✅ Livro encontrado:', {
        id: book.id,
        titulo: book.titulo,
        preco: book.preco,
        estoque: book.estoque
      });
    } else {
      console.log('❌ Livro ID 1 não encontrado');
      
      // Criar um livro de teste
      console.log('\n➕ Criando livro de teste...');
      const newBook = await Books.create({
        titulo: 'Livro de Teste',
        autor: 'Autor Teste',
        descricao: 'Descrição do livro de teste',
        preco: 29.90,
        estoque: 10,
        categoria: 'Ficção',
        isbn: '1234567890123',
        editora: 'Editora Teste',
        anoPublicacao: 2024,
        paginas: 200,
        idioma: 'Português',
        formato: 'Físico',
        imagemFront: 'teste.jpg'
      });
      
      console.log('✅ Livro criado:', {
        id: newBook.id,
        titulo: newBook.titulo,
        preco: newBook.preco,
        estoque: newBook.estoque
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testBooksDB();
