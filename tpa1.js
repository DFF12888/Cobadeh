const mineflayer = require('mineflayer')

// ================== CONFIG ==================
const CONFIG = {
  host: 'play.kampungeles.id',
  port: 25565,
  username: 'SiwaX5',
  version: '1.18.1',
  skipValidation: true,

  // Jeda (detik) antar command saat startup
  delays: {
    afterSpawn: 3,
    login: 4,
    move: 4,
    island: 4,
  },

  // List nick yang boleh di-tpaccept
  tpAllowList: [
    'FyzoOx',
    'Sendyajah',
    'AsKqanaa',
    '0xAltKna',
    'galikuburrgtg',
    'RioAlterMC1',
    'DFF111',
    'IkanTry',
    'SiwaX1',
    'SiwaX5',
    'SiwaX4'
  
  ],

  // Reconnect
  reconnect: {
    enabled: true,
    baseDelayMs: 3000,    // mulai 3 detik
    maxDelayMs: 60000,    // maksimal 60 detik
  },
}
// ============================================

let bot = null
let reconnectDelay = CONFIG.reconnect.baseDelayMs
let reconnectTimer = null
let startupTimer = null

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function cleanText(s) {
  // buang formatting minecraft (mis. §a)
  return String(s || '').replace(/§./g, '').trim()
}

function inAllowList(nick) {
  return CONFIG.tpAllowList.some(n => n.toLowerCase() === nick.toLowerCase())
}

async function runStartupSequence() {
  // pastikan gak dobel
  if (!bot) return

  clearTimeout(startupTimer)

  await sleep(CONFIG.delays.afterSpawn * 1000)

  // /login
  bot.chat('/login 1314436')
  await sleep(CONFIG.delays.login * 1000)

  // /move tycoon
  bot.chat('/move tycoon')
  await sleep(CONFIG.delays.move * 1000)

  // /is
  bot.chat('/is')
  await sleep(CONFIG.delays.island * 1000)
}

function handleTPRequest(messageStr) {
  const msg = cleanText(messageStr)

  // Contoh: "TP | SomeNick has requested to teleport to you."
  const m = msg.match(/^TP\s*\|\s*([A-Za-z0-9_]+)\s+has requested to teleport to you\.\s*$/i)
  if (!m) return

  const nick = m[1]
  if (!inAllowList(nick)) {
    console.log(`[TP] Request dari ${nick} (DITOLAK - bukan allowlist)`)
    return
  }

  console.log(`[TP] Request dari ${nick} (DI-ACCEPT)`)
  // Banyak server support /tpaccept (tanpa arg) atau /tpaccept <nick>.
  // Kalau server kamu butuh arg, ganti jadi: bot.chat(`/tpaccept ${nick}`)
  bot.chat('/tpaccept')
}

function attachBotEvents() {
  bot.once('spawn', async () => {
    console.log('[BOT] Spawned. Jalanin sequence login/move/is ...')
    reconnectDelay = CONFIG.reconnect.baseDelayMs // reset backoff kalau sukses connect
    await runStartupSequence()
  })

  bot.on('messagestr', (message) => {
    handleTPRequest(message)
  })

  bot.on('kicked', (reason) => {
    console.log('[BOT] Kicked:', cleanText(reason))
  })

  bot.on('error', (err) => {
    console.log('[BOT] Error:', err?.message || err)
  })

  bot.on('end', () => {
    console.log('[BOT] Disconnected.')
    if (CONFIG.reconnect.enabled) scheduleReconnect()
  })
}

function scheduleReconnect() {
  if (reconnectTimer) return

  const delay = Math.min(reconnectDelay, CONFIG.reconnect.maxDelayMs)
  console.log(`[BOT] Reconnecting in ${Math.round(delay / 1000)}s...`)

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    reconnectDelay = Math.min(reconnectDelay * 1.7, CONFIG.reconnect.maxDelayMs)
    startBot()
  }, delay)
}

function startBot() {
  try {
    if (bot) {
      bot.removeAllListeners()
      try { bot.quit() } catch {}
      bot = null
    }
  } catch {}

  console.log('[BOT] Connecting...')
  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    skipValidation: CONFIG.skipValidation,
  })

  attachBotEvents()
}

startBot()
