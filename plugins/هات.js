import fs from 'fs';

const handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return;

  if (!args[0]) return m.reply('❌ يرجى إدخال معرف المجموعة بعد الأمر.');

  let groupId = args[0];

  try {
    let groupMetadata = await conn.groupMetadata(groupId).catch(() => null);
    if (!groupMetadata) return m.reply('❌ لم يتم العثور على المجموعة أو لا يمكن الوصول إليها.');

    let sender = m.sender;

    let participants = groupMetadata.participants.map(p => p.id);
    if (!participants.includes(sender)) return m.reply('❌ أنت لست في هذه المجموعة.');

    let isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
    if (isAdmin) return m.reply('✅ أنت بالفعل مشرف في هذه المجموعة.');

    await conn.groupParticipantsUpdate(groupId, [sender], 'promote');
    m.reply('✅ تم ترقيتك إلى مشرف في المجموعة بنجاح.');
  } catch (e) {
    console.error(e);
    m.reply('❌ حدث خطأ أثناء تنفيذ الأمر.');
  }
};

handler.command = /^هات$/i;
handler.private = true; 
handler.rowner = true; 

export default handler;