import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

if (!SUPABASE_URL || !SUPABASE_KEY || !DISCORD_WEBHOOK_URL) {
  console.error('❌ Faltam variáveis de ambiente.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkSubscriptions() {
  console.log('🕵️‍♂️ --- INICIANDO MODO DEBUG ---')

  // 1. Define datas (UTC vs Local pode dar diferença)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  console.log(`📅 Data do Robô (Hoje): ${todayStr}`)
  console.log(`📅 Data do Robô (Amanhã): ${tomorrowStr}`)

  // 2. Busca TUDO para ver o que tem no banco
  console.log('📡 Buscando todas as assinaturas...')
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')

  if (error) {
    console.error('❌ Erro Supabase:', error)
    return
  }

  console.log(`📝 Total encontrado: ${subs.length} assinaturas.`)

  // 3. Verifica uma por uma manualmente
  let found = 0
  for (const sub of subs) {
    // Mostra no log a data crua que vem do banco
    console.log(`   > [${sub.name}] vence em: "${sub.next_billing_date}"`)

    if (sub.next_billing_date === todayStr || sub.next_billing_date === tomorrowStr) {
        console.log(`   🚨 MATCH! Enviando alerta para ${sub.name}...`)
        await sendDiscordWebhook(sub, todayStr)
        found++
    }
  }

  if (found === 0) {
      console.log('⚠️ Nenhuma data coincidiu (Confira se as strings acima são idênticas)')
  } else {
      console.log(`✅ ${found} alertas enviados com sucesso.`)
  }
}

async function sendDiscordWebhook(sub, todayStr) {
  const isToday = sub.next_billing_date === todayStr
  
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Financeiro SaaS (Debug)",
        content: `🚨 **TESTE DE ALERTA** \nAssinatura: ${sub.name} \nVence: ${sub.next_billing_date}`
      })
    })
    console.log(`      📨 Enviado para o Discord.`)
  } catch (err) {
    console.error('      ❌ Erro ao enviar para Discord:', err)
  }
}

checkSubscriptions()