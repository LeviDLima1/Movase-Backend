import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testBooks() {
  console.log('📚 Testando livros...\n');

  try {
    // Buscar livros
    const booksResponse = await fetch(`${BASE_URL}/books`);
    const booksData = await booksResponse.json();
    
    console.log('📚 Livros disponíveis:');
    if (booksData.success && booksData.data?.data?.books) {
      booksData.data.data.books.forEach(book => {
        console.log(`   - ID: ${book.id}, Título: ${book.titulo}, Preço: R$ ${book.preco}, Estoque: ${book.estoque}`);
      });
    } else {
      console.log('❌ Erro ao buscar livros:', booksData.message);
    }

    // Buscar livro específico
    console.log('\n🔍 Buscando livro ID 1...');
    const bookResponse = await fetch(`${BASE_URL}/books/1`);
    const bookData = await bookResponse.json();
    
    if (bookData.success) {
      console.log('✅ Livro encontrado:', {
        id: bookData.data?.data?.id,
        titulo: bookData.data?.data?.titulo,
        preco: bookData.data?.data?.preco,
        estoque: bookData.data?.data?.estoque
      });
    } else {
      console.log('❌ Livro não encontrado:', bookData.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testBooks();
