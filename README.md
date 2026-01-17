# 💰 Sub-Manager

![Status](https://img.shields.io/badge/Status-Production-emerald?style=for-the-badge)
![Tech](https://img.shields.io/badge/React-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge)
![Resend](https://img.shields.io/badge/Resend-Email_API-black?style=for-the-badge)

> **Controle Financeiro Inteligente:** Gerencie assinaturas recorrentes , defina tetos de gastos por categoria e receba alertas automáticos de vencimento.

![Screenshot do Dashboard](src/assets/img/image.png)
---

## 🚀 Sobre o Projeto

O **Sub-Manager** resolve o problema da "assinatura fantasma" e do descontrole financeiro em serviços recorrentes (Netflix, Adobe, AWS, Spotify).

Diferente de planilhas comuns, este projeto é um **Web App Full-Stack** que oferece:
1.  **Monitoramento Ativo:** Cálculo automático de gastos mensais e anuais.
2.  **Conversão de Moedas:** Suporte a assinaturas em BRL, USD e EUR com cotação em tempo real.
3.  **Sistema de Orçamentos (Budgets):** Defina limites de gastos (ex: "Máximo R$ 100 em Streaming") e acompanhe visualmente o progresso.
4.  **Automação Serverless:** Um Cron Job roda diariamente via **GitHub Actions** para verificar o banco de dados e dispara e-mails transacionais individualizados apenas para os usuários que têm contas vencendo, garantindo privacidade e escalabilidade.

## ✨ Funcionalidades

### 📊 Dashboard & Analytics
- **Visão Geral:** Cards com Total Mensal, Projeção Anual e Cotação do Dólar/Euro.
- **Gráfico de Distribuição:** Visualização Donut Chart dos gastos por categoria.
- **Filtros Inteligentes:** Visualize apenas contas "Atrasadas", "Vencendo Hoje" ou por Categoria.

### 💰 Gestão de Orçamento
- **Teto de Gastos:** Crie limites financeiros para categorias específicas.
- **Barra de Progresso Visual:**
  - 🟢 **Verde:** Gasto sob controle.
  - 🟡 **Amarelo:** Alerta (80% do limite).
  - 🔴 **Vermelho:** Limite estourado.
- **CRUD Completo:** Adicione, Edite ou Remova orçamentos dinamicamente.

### 🔄 Assinaturas
- Cadastro detalhado (Ciclo Mensal/Anual, Moeda, Data).
- Suporte a Período de Testes (Trial).
- Renovação rápida com um clique ("Marcar como Pago").

### 🤖 DevOps & Automação
- **Serverless Cron Job:** Script Node.js executado todo dia às 09:00 AM (UTC-3).
- **Notificações:** Alertas enviados para canal privado no Discord via Webhooks.

---
## 🛠️ Tecnologias Utilizadas

**Frontend:**
- React.js + Vite
- TypeScript
- Tailwind CSS (Estilização)
- TanStack Query (State Management)
- Lucide React (Ícones)

**Backend & Data:**
- **Supabase:** PostgreSQL Database, Auth & Row Level Security (RLS).
- **Resend:** API de E-mails Transacionais.
- **Node.js:** Scripts de automação.

**Infraestrutura:**
- **Vercel:** Deploy do Frontend.
- **GitHub Actions:** CI/CD e Agendamento de Scripts (Cron).

---


## 🚀 Como Rodar Localmente
### Pré-requisitos
 - **Node.js instalado**

 - **Conta no Supabase**

### Clone este repositório
```bash
$ git clone https://github.com/seu-usuario/sub-manager.git
cd sub-manager
```

### Instale as dependências:
```bash
$ npm install
```

### Configure as Variáveis de Ambiente: Crie um arquivo .env na raiz e preencha com suas chaves do Supabase:
```
# Frontend (Vercel/Local)
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica

# Backend Scripts (GitHub Secrets / Local)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_admin
RESEND_API_KEY=re_123456_sua_chave_resend
```
### Rode o projeto:
```bash
$ npm run dev
```

## 🤝 Autor
Desenvolvido por Alicia como parte de estudos em Development.