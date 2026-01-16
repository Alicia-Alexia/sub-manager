const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

if (!SUPABASE_URL || !SUPABASE_KEY || !DISCORD_WEBHOOK_URL) {
  console.error('❌ Faltam variáveis de ambiente.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkSubscriptions() {
  console.log('🤖 Iniciando verificação para o Discord...')

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .or(`next_billing_date.eq.${tomorrowStr},next_billing_date.eq.${todayStr}`)

  if (error) {
    console.error('Erro Supabase:', error)
    return
  }

  if (!subs || subs.length === 0) {
    console.log('✅ Nenhuma conta vencendo.')
    return
  }

  console.log(`🚨 Encontradas ${subs.length} contas vencendo.`)
  
  for (const sub of subs) {
    await sendDiscordWebhook(sub, todayStr)
  }
}

async function sendDiscordWebhook(sub, todayStr) {
  const isToday = sub.next_billing_date === todayStr
  
  const color = isToday ? 15548997 : 16776960 
  
  const payload = {
    username: "Financeiro SaaS",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/2953/2953363.png", 
    embeds: [
      {
        title: isToday ? "🚨 VENCE HOJE!" : "⚠️ Vence Amanhã",
        description: `A assinatura **${sub.name}** precisa da sua atenção.`,
        color: color,
        fields: [
          {
            name: "Valor",
            value: `R$ ${sub.price}`,
            inline: true
          },
          {
            name: "Ciclo",
            value: sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual',
            inline: true
          },
          {
            name: "Data",
            value: new Date(sub.next_billing_date).toLocaleDateString('pt-BR'),
            inline: false
          }
        ],
        footer: {
          text: "Acesse o Dashboard para pagar"
        }
      }
    ]
  }

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    console.log(`📨 Alerta enviado para: ${sub.name}`)
  } catch (err) {
    console.error('Erro Discord:', err)
  }
}

checkSubscriptions()