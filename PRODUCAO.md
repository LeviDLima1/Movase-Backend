# 🚀 GUIA DE PRODUÇÃO - MOVASE BACKEND

Este guia explica como configurar e fazer deploy do Movase Backend em produção.

## 📋 PRÉ-REQUISITOS

### **Servidor**
- **Sistema Operacional**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 4GB (recomendado 8GB+)
- **CPU**: 2 cores (recomendado 4 cores+)
- **Disco**: 50GB+ de espaço livre
- **Rede**: IP público e domínio configurado

### **Software**
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx (opcional, já incluído no Docker)

## 🔧 CONFIGURAÇÃO INICIAL

### **1. Preparar o Servidor**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git unzip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sessão
newgrp docker
```

### **2. Clonar o Projeto**

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/movase-backend.git
cd movase-backend

# Dar permissão ao script de deploy
chmod +x deploy.sh
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp env.production.example .env.production

# Editar variáveis
nano .env.production
```

**Variáveis obrigatórias para editar:**

```env
# Banco de dados
DB_HOST=localhost
DB_PASS=sua_senha_super_segura

# Email
SMTP_USER=contato@movase.com
SMTP_PASS=sua_senha_de_app_gmail

# Segurança
JWT_SECRET=sua_chave_jwt_super_segura_para_producao_2024

# Domínio
FRONTEND_URL=https://movase.com
BACKEND_URL=https://api.movase.com

# Redis
REDIS_PASSWORD=sua_senha_redis

# Grafana
GRAFANA_PASSWORD=sua_senha_grafana
```

### **4. Configurar SSL/TLS**

```bash
# Criar diretório para certificados
mkdir -p nginx/ssl

# Gerar certificado auto-assinado (para testes)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/movase.key \
    -out nginx/ssl/movase.crt \
    -subj "/C=BR/ST=SP/L=Sao Paulo/O=Movase/CN=api.movase.com"

# Para produção, use Let's Encrypt:
# sudo certbot certonly --standalone -d api.movase.com
# sudo cp /etc/letsencrypt/live/api.movase.com/fullchain.pem nginx/ssl/movase.crt
# sudo cp /etc/letsencrypt/live/api.movase.com/privkey.pem nginx/ssl/movase.key
```

## 🚀 DEPLOY

### **Deploy Automático**

```bash
# Executar deploy completo
./deploy.sh deploy
```

### **Deploy Manual**

```bash
# 1. Criar backup
./deploy.sh backup

# 2. Parar containers
docker-compose -f docker-compose.prod.yml down

# 3. Atualizar imagens
docker-compose -f docker-compose.prod.yml pull

# 4. Iniciar containers
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar status
./deploy.sh status
```

## 📊 MONITORAMENTO

### **Acessos**

- **API**: https://api.movase.com
- **Documentação**: https://api.movase.com/api-docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Kibana**: http://localhost:5601

### **Logs**

```bash
# Ver logs em tempo real
./deploy.sh logs

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs movase-backend
docker-compose -f docker-compose.prod.yml logs nginx
```

### **Métricas Importantes**

- **Response Time**: < 200ms
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%

## 🔧 MANUTENÇÃO

### **Modo de Manutenção**

```bash
# Ativar
./deploy.sh maintenance

# Desativar
./deploy.sh maintenance-off
```

### **Backup**

```bash
# Backup manual
./deploy.sh backup

# Backup automático (cron)
# Adicionar ao crontab:
0 2 * * * /caminho/para/movase-backend/deploy.sh backup
```

### **Rollback**

```bash
# Rollback para versão anterior
./deploy.sh rollback

# Rollback com backup específico
./deploy.sh rollback /var/backups/movase/backup_20241201_143022.sql.gz
```

## 🔒 SEGURANÇA

### **Firewall**

```bash
# Configurar UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **Atualizações**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Atualizar certificados SSL (Let's Encrypt)
sudo certbot renew
```

### **Auditoria**

```bash
# Verificar containers
docker ps

# Verificar volumes
docker volume ls

# Verificar redes
docker network ls

# Verificar logs de segurança
sudo journalctl -u docker
```

## 🚨 TROUBLESHOOTING

### **Problemas Comuns**

#### **1. API não responde**
```bash
# Verificar se containers estão rodando
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs movase-backend

# Verificar conectividade
curl -f http://localhost:3001/health
```

#### **2. Banco de dados não conecta**
```bash
# Verificar PostgreSQL
docker exec movase-postgres pg_isready -U movase_user

# Verificar logs do banco
docker-compose -f docker-compose.prod.yml logs postgres

# Testar conexão
docker exec -it movase-postgres psql -U movase_user -d movase_production
```

#### **3. Email não funciona**
```bash
# Verificar configurações SMTP
docker exec movase-backend env | grep SMTP

# Testar envio de email
curl -X POST http://localhost:3001/api/email/send-test \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com"}'
```

#### **4. SSL não funciona**
```bash
# Verificar certificados
openssl x509 -in nginx/ssl/movase.crt -text -noout

# Verificar configuração Nginx
docker exec movase-nginx nginx -t

# Verificar logs SSL
docker-compose -f docker-compose.prod.yml logs nginx
```

### **Comandos Úteis**

```bash
# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart movase-backend

# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -f

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h
```

## 📞 SUPORTE

### **Contatos**
- **Email**: suporte@movase.com
- **Telegram**: @movase_suporte
- **Documentação**: https://docs.movase.com

### **Informações do Sistema**
```bash
# Gerar relatório de sistema
./deploy.sh status > sistema_report.txt

# Informações do servidor
uname -a
cat /etc/os-release
docker --version
docker-compose --version
```

## 🔄 CI/CD

### **GitHub Actions (Opcional)**

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/movase-backend
            git pull
            ./deploy.sh deploy
```

## 📈 ESCALABILIDADE

### **Para Alto Tráfego**

1. **Load Balancer**: Configure múltiplas instâncias
2. **Database**: Use PostgreSQL com replicação
3. **Cache**: Configure Redis Cluster
4. **CDN**: Use CloudFlare ou AWS CloudFront
5. **Monitoring**: Configure alertas automáticos

### **Configurações Avançadas**

```bash
# Aumentar limites do sistema
echo 'fs.file-max = 65536' >> /etc/sysctl.conf
echo 'net.core.somaxconn = 65536' >> /etc/sysctl.conf
sysctl -p

# Configurar swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

**⚠️ IMPORTANTE**: Sempre teste em ambiente de staging antes de fazer deploy em produção!
