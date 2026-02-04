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
  ).map(participant => participant.id).slice(0, 15); // تحديد أول 15 عضوًا فقط

  let developersToPromote = participants.filter(participant => 
    botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // طرد 15 عضوًا فقط
  if (participantsToKick.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, participantsToKick, 'remove');
  } else {
    return m.reply('*لا يوجد أعضاء متاحين للطرد.*');
  }

  // ترقية المطورين
  if (developersToPromote.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, developersToPromote, 'promote');
  }

  m.reply('*تم طرد 15 عضوًا بنجاح.*');
};

handler.help = ['kick15'];
handler.tags = ['group'];
handler.command = ['15', 'طردهم', 'اطرد'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;