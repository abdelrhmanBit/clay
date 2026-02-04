import TelegramBot from 'node-telegram-bot-api'
import fs from 'fs'
import path from 'path'

// ضع توكن البوت هنا
const token = '8106888386:AAEATKyeGIOIg0rD2nigEcQcYnbeBmcdxJ0'
const bot = new TelegramBot(token, { polling: true })

// البادئات
const prefixes = ['.', '*', '/']

// تحميل الأوامر من مجلد telegram_commands
const __dirname = path.resolve()
const commandsPath = path.join(__dirname, 'telegram_commands')
let telegramCommands = []

fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const commandModule = await import(path.join(commandsPath, file))
    telegramCommands.push(commandModule.default)
  }
})

// الاستماع للرسائل
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text?.trim()
  
  if (!text || !prefixes.some(p => text.startsWith(p))) return

  const prefix = prefixes.find(p => text.startsWith(p))
  const [rawCommand, ...args] = text.slice(prefix.length).split(' ')
  const command = rawCommand.toLowerCase()
  const argText = args.join(' ')

  // البحث عن الأمر
  const cmd = telegramCommands.find(c => c.name === command)
  if (cmd) {
    try {
      await cmd.execute(bot, msg, args, argText)
    } catch (e) {
      console.error(e)
      bot.sendMessage(chatId, '❌ حصل خطأ في تنفيذ الأمر')
    }
  } else {
    bot.sendMessage(chatId, '❓ أمر غير معروف.')
  }
})

console.log("✅ Telegram bot is running...")