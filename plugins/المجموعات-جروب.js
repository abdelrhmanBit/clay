const handler = async (m, { conn, args, usedPrefix, command }) => {
  const groupStatus = {
    open: 'not_announcement',
    close: 'announcement'
  }[(args[0] || '').toLowerCase()]; // تحويل الحالة إلى حروف صغيرة لتجنب الأخطاء

  // الحصول على صورة المجموعة
  let groupIcon;
  try {
    groupIcon = await conn.profilePictureUrl(m.chat, 'image');
  } catch (e) {
    groupIcon = 'https://files.catbox.moe/pi2y2v.jpg';
  }

  // الحصول على اسم المجموعة
  const groupName = await conn.getName(m.chat);

  // الحصول على حالة المجموعة الحالية
  const groupMetadata = await conn.groupMetadata(m.chat);
  const currentStatus = groupMetadata.announce ? 'close' : 'open';

  // عرض الأزرار بناءً على الحالة الحالية
  if (groupStatus === undefined) {
    const buttons = currentStatus === 'open'
      ? [['غلق', `${usedPrefix + command} close`]]
      : [['فتح', `${usedPrefix + command} open`]];

    await conn.sendButton(m.chat, groupName, wm, groupIcon, buttons, null, null, m);
  } else {
    // تحديث حالة المجموعة
    await conn.groupSettingUpdate(m.chat, groupStatus);
    await conn.sendMessage(m.chat, {
      text: `تم تحديث حالة المجموعة إلى: ${groupStatus === 'not_announcement' ? 'مفتوحة' : 'مغلقة'}`,
    }, { quoted: m });
  }
};

handler.help = ['جروب فتح / قفل'];
handler.tags = ['المجموعات'];
handler.command = /^(جروب)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;