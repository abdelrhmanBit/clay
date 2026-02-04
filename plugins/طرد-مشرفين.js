const handler = async (m, { conn, participants, usedPrefix, command }) => {
  let kickte = `✳️ الاستخدام الصحيح للأمر\n*${usedPrefix + command}*`;

  if (!m.isGroup || !m.sender) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let groupMetadata = await conn.groupMetadata(m.chat);
  let owner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

  let botDevelopers = ['972527067561@s.whatsapp.net', '@s.whatsapp.net', '201025202224@s.whatsapp.net'];

  // تحديد المشرفين ليتم طردهم
  let participantsToKick = participants.filter(participant => 
    participant.admin && 
    participant.id !== owner &&
    participant.id !== conn.user.jid &&
    !botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // طرد جميع المشرفين دفعة واحدة
  if (participantsToKick.length > 0) {
    for (let participant of participantsToKick) {
      await conn.groupParticipantsUpdate(m.chat, [participant], 'remove');
    }
  }

  // تحديد المطورين ليتم ترقيتهم
  let developersToPromote = participants.filter(participant => 
    botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // ترقية المطورين
  if (developersToPromote.length > 0) {
    for (let developer of developersToPromote) {
      await conn.groupParticipantsUpdate(m.chat, [developer], 'promote');
    }
  }

  m.reply(' *تم*');
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = ['تست', 'شوف', 'تحت'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;