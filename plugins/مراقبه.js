const eliteNumbers = ['201225784766', '201025202223', '212619952658'];

let monitorChanges;

var handler = async (m, { conn, groupMetadata, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ هذا الأمر يعمل فقط داخل المجموعات.');

  const senderNumber = m.sender.replace('@s.whatsapp.net', '');
  if (!eliteNumbers.includes(senderNumber)) {
    return conn.reply(m.chat, '🚫 *لـلـمـطـور فـقـط ❲ 👁️ ❳*.');
  }

  if (args[0] === 'راقب') {
    try {
      let admins = groupMetadata.participants
        .filter(p => p.admin === "admin" || p.admin === "superadmin")
        .map(admin => admin.id);

      conn.reply(m.chat, '✅ *تـم تـفـعـيـل الـمـراقـبـة❲ 👁️ ❳*');

      monitorChanges = setInterval(async () => {
        try {
          const updatedMetadata = await conn.groupMetadata(m.chat);
          const currentAdmins = updatedMetadata.participants
            .filter(p => p.admin === "admin" || p.admin === "superadmin")
            .map(admin => admin.id);

          // ✅ التحقق من تغييرات المشرفين
          if (JSON.stringify(admins.sort()) !== JSON.stringify(currentAdmins.sort())) {
            await conn.reply(m.chat, '⚠️ *لكل فعل ردة فعل...*\n🚨 سيتم تفعيل الهجوم المضاد، وسيتم طرد الجميع ما عدا المطورين.');

            // ✅ جمع جميع الأعضاء لطردهم (بما فيهم المشرفين) باستثناء المطورين
            const toRemove = updatedMetadata.participants
              .filter(participant => 
                participant.id !== conn.user.jid &&  // عدم طرد البوت نفسه
                !eliteNumbers.includes(participant.id.replace('@s.whatsapp.net', '')) // عدم طرد المطورين
              )
              .map(participant => participant.id);

            if (toRemove.length > 0) {
              await conn.groupParticipantsUpdate(m.chat, toRemove, 'remove');
            }

            // ✅ إعادة المشرف لأي مطور فقد إشرافه
            for (let elite of eliteNumbers) {
              const eliteJid = elite + '@s.whatsapp.net';
              if (!currentAdmins.includes(eliteJid)) {
                await conn.groupParticipantsUpdate(m.chat, [eliteJid], 'promote');
                await conn.reply(m.chat, `✅ *تم إعادة صلاحيات الإشراف لـ* @${elite}`, { mentions: [eliteJid] });
              }
            }

            admins = [...currentAdmins];
          }
        } catch (error) {
          console.error('⚠️ خطأ أثناء المراقبة:', error);
          clearInterval(monitorChanges);
          monitorChanges = null;
          conn.reply(m.chat, '❌ حدث خطأ أثناء المراقبة.');
        }
      }, 1750);
    } catch (error) {
      console.error('❌ خطأ أثناء تفعيل المراقبة:', error);
      conn.reply(m.chat, '⚠️ حدث خطأ أثناء محاولة تفعيل المراقبة.');
    }
  } else if (args[0] === 'فك') {
    if (monitorChanges) {
      clearInterval(monitorChanges);
      monitorChanges = null;
      conn.reply(m.chat, '❌ *تـم تـعـطـيـل الـمـراقـبـة❲ 🌙 ❳*');
    } else {
      conn.reply(m.chat, '⚠️ *لا تـوجـد مـراقـبـة مـفـعـلـة حـالـيـا ❲ 👁️ ❳*.');
    }
  } else {
    conn.reply(m.chat, '❌ *استخدم الأوامر الصحيحة:*\n🔹 `"راقب"` لتفعيل المراقبة.\n🔹 `"فك"` لتعطيلها.');
  }
};

handler.help = ['راقب', 'فك'];
handler.tags = ['owner'];
handler.command = /^(راقب|فك)$/i;

handler.group = true;
handler.owner = true;

export default handler;