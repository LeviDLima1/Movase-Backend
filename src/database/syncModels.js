import connection from "./connection.js";
import { defineAssociations } from "../model/associations.js";

// Importar modelos para garantir que estejam disponíveis
import "../model/User.js";
import "../model/Books.js";
import "../model/Address.js";
import "../model/Purchases.js";
import "../model/PurchaseItems.js";

/**
 * SINCRONIZAÇÃO DE MODELOS
 * 
 * Este arquivo sincroniza todos os modelos com o banco de dados.
 * Em desenvolvimento, usa 'alter: true' para atualizar tabelas.
 * Em produção, deve usar migrações.
 */

const syncModels = async () => {
    try {
        console.log('🔄 Iniciando sincronização dos modelos...');
        
        // Definir associações entre modelos
        defineAssociations();
        
        // Configuração baseada no ambiente
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isProduction = process.env.NODE_ENV === 'production';
        
        let syncOptions = {};
        
        if (isDevelopment) {
            // Em desenvolvimento: apenas criar tabelas se não existirem
            syncOptions = {
                alter: false,          // Não altera tabelas existentes
                force: false,          // NÃO força recriação (preserva dados)
                logging: console.log   // Mostra logs SQL
            };
            console.log('🔧 Modo desenvolvimento: preservando dados existentes');
        } else if (isProduction) {
            // Em produção: apenas verificar estrutura
            syncOptions = {
                alter: false,          // Não altera tabelas
                force: false,          // Não força recriação
                logging: false         // Não mostra logs
            };
            console.log('🚀 Modo produção: apenas verificando estrutura');
        } else {
            // Modo padrão: criar tabelas se não existirem
            syncOptions = {
                alter: false,
                force: false,
                logging: console.log
            };
            console.log('📋 Modo padrão: criando tabelas se necessário');
        }
        
        // Sincronizar todos os modelos
        await connection.sync(syncOptions);
        
        console.log('✅ Tabelas sincronizadas com sucesso!');
        
        // Verificar se há dados iniciais
        await checkInitialData();
        
    } catch (error) {
        console.error('❌ Erro ao sincronizar as tabelas:', error);
        throw error;
    }
};

/**
 * VERIFICAR DADOS INICIAIS
 * 
 * Verifica se há dados básicos no sistema e cria se necessário.
 */
const checkInitialData = async () => {
    try {
        console.log('🔍 Verificando dados iniciais...');
        
        // Importar modelos
        const User = connection.models.User;
        const Books = connection.models.Books;
        
        // Verificar se há usuário admin
        const adminExists = await User.findOne({
            where: { email: 'admin@movase.com' }
        });
        
        if (!adminExists) {
            console.log('👤 Criando usuário administrador...');
            
            // Importar bcrypt para hash da senha
            const bcrypt = await import('bcrypt');
            
            await User.create({
                name: 'Administrador',
                email: 'admin@movase.com',
                telefone: '11999999999',
                CPF: '12345678901',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                status: 'ativo',
                emailVerificado: true,
                aceiteTermos: true,
                aceitePrivacidade: true
            });
            
            console.log('✅ Usuário administrador criado!');
        }
        
        // Verificar se há livros de exemplo
        const booksCount = await Books.count();
        
        if (booksCount === 0) {
            console.log('📚 Criando livros de exemplo...');
            
            await Books.bulkCreate([
                {
                    titulo: 'FÉ X MEDO - LUCIANO PINHEIRO',
                    autor: 'Luciano Pinheiro',
                    descricao: 'Uma história emocionante de aventuras e descobertas que transporta o leitor para mundos extraordinários.',
                    sinopse: 'Um livro que aborda a luta entre fé e medo na vida cristã moderna.',
                    preco: 35.00,
                    precoOriginal: 45.00,
                    estoque: 15,
                    categoria: 'Religioso',
                    subcategoria: 'Cristão',
                    isbn: '978-85-1234-567-8',
                    paginas: 180,
                    ano: 2023,
                    editora: 'Movase',
                    idioma: 'Português',
                    formato: 'Físico',
                    peso: 0.5,
                    dimensoes: '16x23cm',
                    status: 'ativo',
                    destaque: true,
                    novidade: false,
                    promocao: true,
                    imagemFront: '/api/images/livros/CapaLivro1Front.png',
                    imagemBack: '/api/images/livros/CapaLivro1Back.png',
                    tags: ['fé', 'medo', 'cristianismo', 'superação'],
                    avaliacoes: 4.5,
                    totalAvaliacoes: 23,
                    vendas: 156,
                    visualizacoes: 89
                },
                {
                    titulo: 'UMA GERAÇÃO SE POSICIONA',
                    autor: 'Juliana Prado',
                    descricao: 'Um chamado para a nova geração se posicionar em fé.',
                    sinopse: 'Um mistério envolvente que mantém o leitor em suspense até o final.',
                    preco: 30.00,
                    precoOriginal: 30.00,
                    estoque: 8,
                    categoria: 'Religioso',
                    subcategoria: 'Cristão',
                    isbn: '978-85-1234-567-9',
                    paginas: 220,
                    ano: 2023,
                    editora: 'Movase',
                    idioma: 'Português',
                    formato: 'Físico',
                    peso: 0.4,
                    dimensoes: '14x21cm',
                    status: 'ativo',
                    destaque: false,
                    novidade: true,
                    promocao: false,
                    imagemFront: '/api/images/livros/CapaLivro2Front.jpg',
                    imagemBack: '/api/images/livros/CapaLivro2Back.jpg',
                    tags: ['geração', 'posicionamento', 'fé', 'jovens'],
                    avaliacoes: 4.8,
                    totalAvaliacoes: 45,
                    vendas: 89,
                    visualizacoes: 67
                }
            ]);
            
            console.log('✅ Livros de exemplo criados!');
        }
        
        console.log('✅ Verificação de dados iniciais concluída!');
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados iniciais:', error);
        // Não lançar erro aqui, pois não é crítico
    }
};

export default syncModels;