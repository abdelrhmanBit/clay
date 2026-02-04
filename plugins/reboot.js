const handler = async (m, { conn, command, args, isOwner, usedPrefix }) => {

  switch (args[0]) {

    case 'confirm':
      if (isOwner) {
        await m.reply('Restarting the bot...');
        process.exit(0);
      }
      break;

    case 'cancel':
      if (isOwner) {
        await m.reply('Bot restart canceled.');
      }
      break;

    default:
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeFormatted = `${hours}h - ${minutes}m - ${seconds}s`;

      const buttons = [
        { buttonId: usedPrefix + command + ' confirm', buttonText: { displayText: 'Confirm' }, type: 1 },
        { buttonId: usedPrefix + command + ' cancel', buttonText: { displayText: 'Cancel' }, type: 1 }
      ];

      await conn.sendMessage(m.chat, {
        text: `Do you want to restart the bot?`,
        footer: wm + '\n☞ uptime: ' + uptimeFormatted,
        buttons,
        headerType: 1,
        viewOnce: true
      });

  }
};

handler.command = ['رسترت'];
handler.owner = true;

export default handler;