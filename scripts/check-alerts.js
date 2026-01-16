import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('❌ Faltam variáveis de ambiente (SUPABASE_URL, SERVICE_ROLE_KEY ou RESEND_API_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function checkAndNotify() {
  console.log('🔄 Iniciando verificação diária...');
  const today = new Date();
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .in('status', ['active', 'trial']);

  if (error) {
    console.error('Erro ao buscar dados:', error);
    return;
  }

  const alerts = subscriptions.filter(sub => {
    if (!sub.next_billing_date) return false;
    
    const subDate = new Date(sub.next_billing_date + 'T00:00:00');
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    
    const diffTime = subDate - todayDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 0 || diffDays === 1;
  });

  if (alerts.length === 0) {
    console.log('✅ Nenhuma assinatura vencendo hoje ou amanhã.');
    return;
  }

  console.log(`⚠️ Encontradas ${alerts.length} contas vencendo.`);

  const userAlerts = {};
  
  alerts.forEach(sub => {
    if (!userAlerts[sub.user_id]) {
      userAlerts[sub.user_id] = [];
    }
    userAlerts[sub.user_id].push(sub);
  });

  for (const userId in userAlerts) {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user || !user.email) {
      console.error(`❌ Não foi possível achar o e-mail do usuário ${userId}`);
      continue;
    }

    const userSubs = userAlerts[userId];
    console.log(`📧 Enviando alerta para: ${user.email} (${userSubs.length} contas)`);

    const emailHtml = `
      <div style="font-family: sans-serif; color: #333;">
        <h1>⚠️ Atenção: Contas Vencendo!</h1>
        <p>Olá! O Sub-Manager detectou os seguintes vencimentos para você:</p>
        <ul>
          ${userSubs.map(sub => `
            <li style="margin-bottom: 10px;">
              <strong>${sub.name}</strong> - R$ ${sub.price}<br/>
              Vencimento: ${new Date(sub.next_billing_date).toLocaleDateString('pt-BR')}
            </li>
          `).join('')}
        </ul>
        <p>Acesse seu painel para dar baixa: <a href="https://seu-projeto.vercel.app">Ir para Dashboard</a></p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'Sub-Manager <onboarding@resend.dev>', 
        to: user.email, 
        subject: `🔔 Alerta: ${userSubs.length} contas vencendo!`,
        html: emailHtml
      });
      console.log(`✅ Email enviado com sucesso para ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Falha ao enviar email para ${user.email}:`, emailError);
    }
  }
}

checkAndNotify();