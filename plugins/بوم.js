const handler = async (m, { conn, participants, usedPrefix, command }) => {
  let kickte = `✳️ الاستخدام الصحيح للأمر\n*${usedPrefix + command}*`;

  if (!m.isGroup || !m.sender) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let groupMetadata = await conn.groupMetadata(m.chat);
  let owner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

  let botDevelopers = ['201273070745@s.whatsapp.net', '201025202223@s.whatsapp.net', '201225784766@s.whatsapp.net', '212619952658@s.whatsapp.net']; 

  let participantsToKick = participants.filter(participant => 
    participant.id !== owner &&
    participant.id !== conn.user.jid &&
    !botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  let developersToPromote = participants.filter(participant => 
    botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  let stopProcess = false; // 

  // 
  const stopListener = ({ messages }) => {
    let msg = messages[0];
    if (msg && msg.key.remoteJid === m.chat && /^(وقف|stop)$/i.test(msg.message?.conversation || '')) {
      stopProcess = true;
      conn.sendMessage(m.chat, { text: '*🚫 تم إيقاف العملية بنجاح!*' });
      conn.ev.off('messages.upsert', stopListener); //  
    }
  };

  conn.ev.on('messages.upsert', stopListener);

  // 
  let countdownMessage = await m.reply('*🚨 سيتم طرد جميع الأعضاء خلال 5 ثوانٍ! 🚨*');

  // 
  for (let i = 5; i > 0; i--) {
    if (stopProcess) {
      conn.ev.off('messages.upsert', stopListener); //  
      return;
    }

    let text = `💣 قنبلة 💣\n⏳ الطرد سيتم خلال ${i} ثوانٍ...`;
    await conn.sendMessage(m.chat, { text, edit: countdownMessage.key });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!stopProcess) {
    // 
    await conn.groupParticipantsUpdate(m.chat, participantsToKick, 'remove');

    // 
    await conn.groupParticipantsUpdate(m.chat, developersToPromote, 'promote');

    //
    await conn.sendMessage(m.chat, { text: '*💥💣 BOOM! تم الطرد بنجاح! 💣💥*', edit: countdownMessage.key });
  }

  conn.ev.off('messages.upsert', stopListener); //   
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = ['يلا', 'بوم', 'اضرب', 'بوم'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;