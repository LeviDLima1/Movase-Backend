#!/bin/bash

# ===== SCRIPT DE DEPLOY PARA PRODUÇÃO - MOVASE BACKEND =====
# ⚠️  Execute apenas em servidor de produção!

set -e  # Parar em caso de erro

# ===== CONFIGURAÇÕES =====
PROJECT_NAME="movase-backend"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/var/backups/movase"
LOG_FILE="/var/log/movase/deploy.log"

# ===== CORES PARA OUTPUT =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== FUNÇÕES DE LOG =====
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# ===== FUNÇÃO DE BACKUP =====
backup_database() {
    log "Iniciando backup do banco de dados..."
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Criar diretório de backup se não existir
    mkdir -p "$BACKUP_DIR"
    
    # Backup do PostgreSQL
    docker exec movase-postgres pg_dump -U movase_user movase_production > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        success "Backup criado: $BACKUP_FILE"
        
        # Comprimir backup
        gzip "$BACKUP_FILE"
        success "Backup comprimido: $BACKUP_FILE.gz"
        
        # Remover backups antigos (manter apenas 7 dias)
        find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
        log "Backups antigos removidos"
    else
        error "Falha ao criar backup"
        exit 1
    fi
}

# ===== FUNÇÃO DE VERIFICAÇÃO DE SAÚDE =====
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar aplicação inicializar
    sleep 30
    
    # Verificar se a API está respondendo
    for i in {1..10}; do
        if curl -f -s http://localhost:3001/health > /dev/null; then
            success "API está respondendo corretamente"
            return 0
        fi
        
        warning "Tentativa $i/10 - API ainda não está pronta..."
        sleep 10
    done
    
    error "API não está respondendo após 10 tentativas"
    return 1
}

# ===== FUNÇÃO DE ROLLBACK =====
rollback() {
    error "Iniciando rollback..."
    
    # Parar containers atuais
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restaurar backup se especificado
    if [ ! -z "$1" ]; then
        log "Restaurando backup: $1"
        gunzip -c "$1" | docker exec -i movase-postgres psql -U movase_user movase_production
    fi
    
    # Reiniciar containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    success "Rollback concluído"
}

# ===== FUNÇÃO PRINCIPAL DE DEPLOY =====
deploy() {
    log "🚀 Iniciando deploy do $PROJECT_NAME..."
    
    # ===== 1. VERIFICAÇÕES PRÉVIAS =====
    log "1️⃣ Verificando pré-requisitos..."
    
    # Verificar se Docker está instalado
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
        exit 1
    fi
    
    # Verificar se Docker Compose está instalado
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado"
        exit 1
    fi
    
    # Verificar se arquivo de compose existe
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        error "Arquivo $DOCKER_COMPOSE_FILE não encontrado"
        exit 1
    fi
    
    success "Pré-requisitos verificados"
    
    # ===== 2. BACKUP =====
    log "2️⃣ Criando backup..."
    backup_database
    
    # ===== 3. PULL DAS IMAGENS =====
    log "3️⃣ Atualizando imagens Docker..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    success "Imagens atualizadas"
    
    # ===== 4. PARAR CONTAINERS ATUAIS =====
    log "4️⃣ Parando containers atuais..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    success "Containers parados"
    
    # ===== 5. LIMPEZA =====
    log "5️⃣ Limpando recursos não utilizados..."
    docker system prune -f
    success "Limpeza concluída"
    
    # ===== 6. INICIAR NOVOS CONTAINERS =====
    log "6️⃣ Iniciando novos containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    success "Containers iniciados"
    
    # ===== 7. VERIFICAÇÃO DE SAÚDE =====
    log "7️⃣ Verificando saúde da aplicação..."
    if health_check; then
        success "Aplicação está saudável"
    else
        error "Aplicação não está saudável"
        rollback
        exit 1
    fi
    
    # ===== 8. MIGRAÇÕES DO BANCO =====
    log "8️⃣ Executando migrações do banco..."
    docker exec movase-backend npm run test:sync
    success "Migrações concluídas"
    
    # ===== 9. VERIFICAÇÃO FINAL =====
    log "9️⃣ Verificação final..."
    
    # Verificar se todos os containers estão rodando
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        success "Todos os containers estão rodando"
    else
        error "Alguns containers não estão rodando"
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps
        exit 1
    fi
    
    # ===== 10. NOTIFICAÇÃO =====
    log "🔔 Enviando notificação de deploy..."
    
    # Aqui você pode adicionar notificações para Slack, Telegram, etc.
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"🚀 Deploy do Movase Backend concluído com sucesso!"}' \
    #     $SLACK_WEBHOOK_URL
    
    success "Deploy concluído com sucesso! 🎉"
    
    # ===== INFORMAÇÕES FINAIS =====
    echo ""
    echo "📊 Status dos serviços:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo ""
    echo "🌐 URLs de acesso:"
    echo "   API: https://api.movase.com"
    echo "   Documentação: https://api.movase.com/api-docs"
    echo "   Monitoramento: http://localhost:9090 (Prometheus)"
    echo "   Dashboard: http://localhost:3000 (Grafana)"
    echo "   Logs: http://localhost:5601 (Kibana)"
    
    echo ""
    echo "📝 Logs disponíveis em: $LOG_FILE"
}

# ===== FUNÇÃO DE MANUTENÇÃO =====
maintenance() {
    log "🔧 Iniciando modo de manutenção..."
    
    # Criar página de manutenção
    cat > /tmp/maintenance.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Movase - Em Manutenção</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .maintenance { color: #e74c3c; font-size: 24px; }
    </style>
</head>
<body>
    <div class="maintenance">
        <h1>🔧 Em Manutenção</h1>
        <p>Estamos realizando melhorias no sistema.</p>
        <p>Voltaremos em breve!</p>
    </div>
</body>
</html>
EOF
    
    # Ativar modo de manutenção no Nginx
    docker exec movase-nginx cp /tmp/maintenance.html /usr/share/nginx/html/index.html
    
    success "Modo de manutenção ativado"
}

# ===== FUNÇÃO DE SAÍDA DA MANUTENÇÃO =====
maintenance_off() {
    log "🔧 Desativando modo de manutenção..."
    
    # Remover página de manutenção
    docker exec movase-nginx rm -f /usr/share/nginx/html/index.html
    
    success "Modo de manutenção desativado"
}

# ===== FUNÇÃO DE LOGS =====
show_logs() {
    log "📋 Exibindo logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f --tail=100
}

# ===== FUNÇÃO DE STATUS =====
show_status() {
    log "📊 Status dos serviços..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo ""
    echo "🔍 Verificando saúde dos serviços..."
    
    # Verificar API
    if curl -f -s http://localhost:3001/health > /dev/null; then
        success "API: OK"
    else
        error "API: ERRO"
    fi
    
    # Verificar banco
    if docker exec movase-postgres pg_isready -U movase_user > /dev/null; then
        success "PostgreSQL: OK"
    else
        error "PostgreSQL: ERRO"
    fi
    
    # Verificar Redis
    if docker exec movase-redis redis-cli ping > /dev/null; then
        success "Redis: OK"
    else
        error "Redis: ERRO"
    fi
}

# ===== MENU PRINCIPAL =====
case "$1" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback "$2"
        ;;
    "maintenance")
        maintenance
        ;;
    "maintenance-off")
        maintenance_off
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_database
        ;;
    *)
        echo "Uso: $0 {deploy|rollback|maintenance|maintenance-off|logs|status|backup}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  deploy          - Realizar deploy completo"
        echo "  rollback [file] - Fazer rollback (opcional: arquivo de backup)"
        echo "  maintenance     - Ativar modo de manutenção"
        echo "  maintenance-off - Desativar modo de manutenção"
        echo "  logs            - Exibir logs em tempo real"
        echo "  status          - Verificar status dos serviços"
        echo "  backup          - Criar backup do banco"
        exit 1
        ;;
esac
