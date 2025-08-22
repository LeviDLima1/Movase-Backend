import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connection from './src/database/connection.js';
import Image from './src/model/Image.js';
import Books from './src/model/Books.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateImagesToDatabase() {
    console.log('🔄 Iniciando migração de imagens para o banco de dados...\n');

    try {
        // Testar conexão
        await connection.authenticate();
        console.log('✅ Conexão com banco estabelecida');

        // Buscar todos os livros
        const books = await Books.findAll();
        console.log(`📚 Encontrados ${books.length} livros`);

        const imagesDir = path.join(__dirname, 'public', 'images', 'livros');

        if (!fs.existsSync(imagesDir)) {
            console.log('❌ Diretório de imagens não encontrado');
            return;
        }

        const imageFiles = fs.readdirSync(imagesDir);
        console.log(`🖼️  Encontrados ${imageFiles.length} arquivos de imagem`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const book of books) {
            console.log(`\n📖 Processando livro: ${book.titulo}`);

            // Processar imagem frontal
            if (book.imagemFront) {
                const frontImagePath = path.join(imagesDir, path.basename(book.imagemFront));

                if (fs.existsSync(frontImagePath)) {
                    try {
                        const imageBuffer = fs.readFileSync(frontImagePath);
                        const mimeType = getMimeType(frontImagePath);

                        await Image.create({
                            filename: path.basename(book.imagemFront),
                            originalName: path.basename(book.imagemFront),
                            mimeType: mimeType,
                            size: imageBuffer.length,
                            data: imageBuffer,
                            entityType: 'book',
                            entityId: book.id,
                            imageType: 'front',
                            alt: `Capa frontal de ${book.titulo}`,
                            description: `Capa frontal do livro ${book.titulo}`,
                            isPublic: true,
                            order: 1
                        });

                        console.log(`   ✅ Imagem frontal migrada`);
                        migratedCount++;
                    } catch (error) {
                        console.log(`   ❌ Erro ao migrar imagem frontal: ${error.message}`);
                        errorCount++;
                    }
                }
            }

            // Processar imagem traseira
            if (book.imagemBack) {
                const backImagePath = path.join(imagesDir, path.basename(book.imagemBack));

                if (fs.existsSync(backImagePath)) {
                    try {
                        const imageBuffer = fs.readFileSync(backImagePath);
                        const mimeType = getMimeType(backImagePath);

                        await Image.create({
                            filename: path.basename(book.imagemBack),
                            originalName: path.basename(book.imagemBack),
                            mimeType: mimeType,
                            size: imageBuffer.length,
                            data: imageBuffer,
                            entityType: 'book',
                            entityId: book.id,
                            imageType: 'back',
                            alt: `Capa traseira de ${book.titulo}`,
                            description: `Capa traseira do livro ${book.titulo}`,
                            isPublic: true,
                            order: 2
                        });

                        console.log(`   ✅ Imagem traseira migrada`);
                        migratedCount++;
                    } catch (error) {
                        console.log(`   ❌ Erro ao migrar imagem traseira: ${error.message}`);
                        errorCount++;
                    }
                }
            }
        }

        console.log(`\n🎉 Migração concluída!`);
        console.log(`   ✅ ${migratedCount} imagens migradas com sucesso`);
        console.log(`   ❌ ${errorCount} erros encontrados`);

        console.log(`\n💡 Próximos passos:`);
        console.log(`   1. Testar o novo sistema de imagens`);
        console.log(`   2. Atualizar o frontend para usar as novas URLs`);
        console.log(`   3. Remover os campos imagemFront/imagemBack do modelo Books`);

    } catch (error) {
        console.error('❌ Erro durante migração:', error);
    } finally {
        await connection.close();
    }
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

migrateImagesToDatabase();
