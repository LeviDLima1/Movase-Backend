import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'movase',
  user: 'postgres',
  password: '0000'
});

async function updateImages() {
  try {
    console.log('🖼️  Atualizando imagens dos livros...\n');
    
    // Atualizar o primeiro livro
    await pool.query(`
      UPDATE books 
      SET "imagemFront" = '/api/images/livros/CapaLivro1Front.png',
          "imagemBack" = '/api/images/livros/CapaLivro1Back.png'
      WHERE id = 1;
    `);
    console.log('✅ Livro 1 atualizado: FÉ X MEDO - LUCIANO PINHEIRO');
    
    // Atualizar o segundo livro
    await pool.query(`
      UPDATE books 
      SET "imagemFront" = '/api/images/livros/CapaLivro2Front.jpg',
          "imagemBack" = '/api/images/livros/CapaLivro2Back.jpg'
      WHERE id = 2;
    `);
    console.log('✅ Livro 2 atualizado: UMA GERAÇÃO SE POSICIONA');
    
    // Verificar se foi atualizado
    const result = await pool.query('SELECT id, titulo, "imagemFront", "imagemBack" FROM books LIMIT 5;');
    
    console.log('\n📚 Dados atualizados:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id} | Título: ${row.titulo}`);
      console.log(`   Front: ${row.imagemFront || 'NULL'}`);
      console.log(`   Back: ${row.imagemBack || 'NULL'}`);
      console.log('---');
    });
    
    console.log('🎉 Imagens atualizadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar imagens:', error.message);
  } finally {
    await pool.end();
  }
}

updateImages();
