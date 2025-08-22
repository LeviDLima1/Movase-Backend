# 🧪 COMO TESTAR A SINCRONIZAÇÃO

## 📋 PRÉ-REQUISITOS

### 1. Banco de Dados PostgreSQL
- Instalar PostgreSQL
- Criar um banco de dados chamado `movase_db`
- Anotar usuário, senha e porta

### 2. Arquivo .env
Criar um arquivo `.env` na raiz do projeto com:

```env
# ===== CONFIGURAÇÕES DO BANCO DE DADOS =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movase_db
DB_USER=seu_usuario
DB_PASS=sua_senha

# ===== CONFIGURAÇÕES DO SERVIDOR =====
PORT=3001
NODE_ENV=development

# ===== CONFIGURAÇÕES DE SEGURANÇA =====
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d
```

## 🚀 COMO EXECUTAR OS TESTES

### Opção 1: Teste Completo de Sincronização
```bash
npm run test:sync
```

**O que este comando faz:**
1. ✅ Testa conexão com o banco
2. ✅ Sincroniza todos os modelos
3. ✅ Cria dados de exemplo
4. ✅ Testa relacionamentos
5. ✅ Remove dados de teste
6. ✅ Fecha conexão

### Opção 2: Iniciar Servidor Completo
```bash
npm run test:server
```

**O que este comando faz:**
1. ✅ Testa conexão com o banco
2. ✅ Sincroniza modelos
3. ✅ Inicia servidor na porta 3001
4. ✅ Fica aguardando requisições

### Opção 3: Modo Desenvolvimento
```bash
npm run dev
```

**O que este comando faz:**
1. ✅ Reinicia automaticamente quando há mudanças
2. ✅ Ideal para desenvolvimento

## 📊 O QUE SERÁ TESTADO

### 1. Conexão com Banco
- Verifica se consegue conectar ao PostgreSQL
- Testa credenciais e configurações

### 2. Sincronização de Modelos
- Cria todas as tabelas no banco
- Aplica índices e constraints
- Define relacionamentos

### 3. Criação de Dados
- Cria usuário de teste
- Cria endereço de teste
- Cria livro de teste
- Cria pedido de teste
- Cria item do pedido

### 4. Relacionamentos
- Testa User → Address (1:N)
- Testa User → Purchases (1:N)
- Testa Purchases → PurchaseItems (1:N)
- Testa PurchaseItems → Books (N:1)

### 5. Hooks e Validações
- Testa geração automática de números
- Testa cálculos automáticos
- Testa validações de dados
- Testa atualização de estoque

## 🔍 O QUE ESPERAR NO CONSOLE

### ✅ Sucesso:
```
🧪 Iniciando teste de sincronização...

1️⃣ Testando conexão com o banco...
✅ Conexão OK!

2️⃣ Sincronizando modelos...
🔗 Definindo associações entre modelos...
✅ Associações definidas com sucesso!
✅ Sincronização OK!

3️⃣ Verificando tabelas criadas...
📋 Tabelas no banco: users, addresses, books, purchases, purchase_items
✅ Tabelas verificadas!

4️⃣ Testando criação de dados...
👤 Usuário criado: João Silva
📍 Endereço criado: Rua das Flores
📚 Livro criado: O Poder da Fé
🛒 Pedido criado: PED-20241201-143022
📦 Item do pedido criado

5️⃣ Testando consultas relacionais...
👤 Usuário com endereços: 1 endereços
🛒 Pedido com itens: 1 itens
📚 Livro no pedido: O Poder da Fé

6️⃣ Limpando dados de teste...
🧹 Dados de teste removidos

🎉 Teste concluído com sucesso!
✅ Todos os modelos estão funcionando corretamente!
```

### ❌ Erro:
```
❌ Erro no teste: SequelizeConnectionError
📋 Detalhes: connect ECONNREFUSED 127.0.0.1:5432
```

## 🛠️ SOLUÇÃO DE PROBLEMAS

### Erro de Conexão
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Iniciar PostgreSQL
sudo service postgresql start

# Verificar porta
sudo netstat -tlnp | grep 5432
```

### Erro de Credenciais
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar usuário
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';

# Criar banco
CREATE DATABASE movase_db OWNER seu_usuario;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE movase_db TO seu_usuario;
```

### Erro de Dependências
```bash
# Instalar dependências
npm install

# Verificar se todas estão instaladas
npm list
```

## 📁 ESTRUTURA CRIADA NO BANCO

Após a sincronização, você terá estas tabelas:

1. **users** - Usuários do sistema
2. **addresses** - Endereços dos usuários
3. **books** - Catálogo de livros
4. **purchases** - Pedidos/compras
5. **purchase_items** - Itens dos pedidos

## 🎯 PRÓXIMOS PASSOS

Após o teste bem-sucedido:

1. **Criar Controllers** - Para gerenciar as rotas
2. **Criar Routes** - Para definir endpoints da API
3. **Criar Middlewares** - Para autenticação e validação
4. **Conectar Frontend** - Integrar com o Next.js

## 💡 DICAS

- Sempre teste em ambiente de desenvolvimento primeiro
- Mantenha backup do banco antes de grandes mudanças
- Use `NODE_ENV=development` para logs detalhados
- Monitore o console para identificar problemas rapidamente
