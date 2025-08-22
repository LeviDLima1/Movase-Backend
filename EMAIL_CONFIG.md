# 📧 Configuração do Sistema de Email

## 🔧 Configuração SMTP

Para ativar o sistema de email, adicione as seguintes variáveis ao seu arquivo `.env`:

### **Gmail (Recomendado para desenvolvimento)**
```env
# Configuração SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# URLs do Frontend
FRONTEND_URL=http://localhost:3000

# Emails administrativos (separados por vírgula)
ADMIN_EMAILS=admin@movase.com,gerente@movase.com
```

### **Outros provedores SMTP**

#### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

#### **Yahoo**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

#### **Provedor personalizado**
```env
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-usuario
SMTP_PASS=sua-senha
```

## 🔐 Configuração do Gmail

Para usar o Gmail, você precisa:

1. **Ativar autenticação de 2 fatores** na sua conta Google
2. **Gerar uma senha de app**:
   - Vá para [Conta Google](https://myaccount.google.com/)
   - Segurança → Verificação em duas etapas
   - Senhas de app → Gerar nova senha
   - Use esta senha no `SMTP_PASS`

## 📧 Templates Disponíveis

O sistema inclui os seguintes templates:

### **1. Welcome (Boas-vindas)**
- **Uso**: Enviado para novos usuários
- **Variáveis**: `name`, `email`, `loginUrl`

### **2. Email Verification (Verificação)**
- **Uso**: Confirmação de email
- **Variáveis**: `name`, `verificationUrl`, `expiresIn`

### **3. Password Reset (Recuperação)**
- **Uso**: Recuperação de senha
- **Variáveis**: `name`, `resetUrl`, `expiresIn`

### **4. Order Confirmation (Pedido)**
- **Uso**: Confirmação de compra
- **Variáveis**: `name`, `orderNumber`, `orderDate`, `total`, `items`, `trackingUrl`

### **5. Order Status Update (Status)**
- **Uso**: Atualização de status
- **Variáveis**: `name`, `orderNumber`, `status`, `message`, `trackingUrl`

### **6. Admin Notification (Admin)**
- **Uso**: Notificações administrativas
- **Variáveis**: `subject`, `message`, `data`, `timestamp`

## 🧪 Testando o Sistema

### **1. Testar conexão SMTP**
```bash
GET /api/email/test-connection
```

### **2. Listar templates**
```bash
GET /api/email/templates
```

### **3. Enviar email de teste (Admin)**
```bash
POST /api/email/send-test
{
  "email": "teste@exemplo.com",
  "template": "welcome",
  "context": {
    "name": "João Silva"
  }
}
```

### **4. Ver estatísticas (Admin)**
```bash
GET /api/email/stats
```

## 🔄 Integração com Controllers

O sistema de email é automaticamente integrado com:

### **AuthController**
- Envio de email de boas-vindas no registro
- Envio de email de verificação
- Envio de email de recuperação de senha

### **PurchaseController**
- Envio de confirmação de pedido
- Envio de atualizações de status

### **UserController**
- Notificações administrativas

## 📊 Monitoramento

O sistema inclui:

- **Fila de processamento** com retry automático
- **Estatísticas** de envio (enviados, falhas, na fila)
- **Logs** detalhados de cada operação
- **Tratamento de erros** robusto

## 🚀 Funcionalidades Avançadas

- **Processamento assíncrono** com fila
- **Retry automático** em caso de falha
- **Templates responsivos** com Handlebars
- **Configuração flexível** para diferentes provedores
- **Monitoramento** em tempo real
