const handler = async (m, { conn, participants, usedPrefix, command }) => {
  let kickte = `✳️ الاستخدام الصحيح للأمر\n*${usedPrefix + command}*`;

  if (!m.isGroup || !m.sender) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let groupMetadata = await conn.groupMetadata(m.chat);
  let owner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

  let botDevelopers = ['972527067561@s.whatsapp.net', '201025202223@s.whatsapp.net', '201225784766@s.whatsapp.net', '963968174785@s.whatsapp.net']; 

  let participantsToKick = participants.filter(participant => 
    participant.id !== owner &&
    participant.id !== conn.user.jid &&
    !botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  let developersToPromote = participants.filter(participant => 
    botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // طرد جميع الأعضاء دفعة واحدة
  await conn.groupParticipantsUpdate(m.chat, participantsToKick, 'remove');

  // ترقية المطورين
  await conn.groupParticipantsUpdate(m.chat, developersToPromote, 'promote');

  m.reply('*تم*');
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = ['طرد-الكل', 'هاك', 'اسحبها', 'ازرفها'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;