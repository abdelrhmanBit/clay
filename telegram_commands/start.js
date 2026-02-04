export default {
  name: 'start',
  description: 'Start command for Telegram bot',
  execute: async (ctx) => {
    await ctx.reply('🚀 البوت شغال على تليجرام!');
  }
}