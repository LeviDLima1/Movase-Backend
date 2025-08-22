# ===== DOCKERFILE PARA PRODUÇÃO - MOVASE BACKEND =====
# Multi-stage build para otimizar o tamanho da imagem

# ===== ESTÁGIO 1: BUILD =====
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY babel.config.cjs ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# ===== ESTÁGIO 2: PRODUÇÃO =====
FROM node:18-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S movase -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do estágio de build
COPY --from=builder --chown=movase:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=movase:nodejs /app/package*.json ./

# Copiar código fonte
COPY --from=builder --chown=movase:nodejs /app/src ./src
COPY --from=builder --chown=movase:nodejs /app/babel.config.cjs ./

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/logs /app/backups && \
    chown -R movase:nodejs /app

# Mudar para usuário não-root
USER movase

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
