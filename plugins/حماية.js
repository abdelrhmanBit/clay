const eliteNumbers = ['201225784766', '201273398672', '212619952658', '972527067561']; // الأرقام المسموح بها فقط

let monitorChanges = null; // متغير للمراقبة
let isProtectionActive = false; // حالة الحماية

/**
 * معالجة أوامر الحماية
 * @param {Object} m - رسالة المجموعة
 * @param {Object} conn - اتصال البوت
 * @param {Object} groupMetadata - بيانات المجموعة
 * @param {Array} args - الأوامر المرسلة
 */
const handler = async (m, { conn, groupMetadata, args }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '🚫 هذا الأمر يعمل فقط داخل المجموعات.');
  }

  const senderNumber = m.sender.replace('@s.whatsapp.net', '');
  if (!eliteNumbers.includes(senderNumber)) {
    return conn.reply(m.chat, ' *لـلـمـطـور فـقـط ❲ 👁️ ❳*.');
  }

  if (args[0]?.toLowerCase() === 'فتح') {
    if (isProtectionActive) {
      return conn.reply(m.chat, '⚠️ الحماية مفعلّة بالفعل.');
    }

    try {
      isProtectionActive = true;
      let admins = groupMetadata.participants.filter(p => p.admin).map(admin => admin.id);
      conn.reply(m.chat, ' *تـم تـفـعـيـل الـحـمـايـة❲ 🌙 ❳*');

      const startProtection = async () => {
        while (isProtectionActive) {
          try {
            const updatedMetadata = await conn.groupMetadata(m.chat);
            const currentAdmins = updatedMetadata.participants.filter(p => p.admin).map(admin => admin.id);

            // التحقق من حدوث تغيير في المشرفين
            if (admins.length !== currentAdmins.length || !admins.every(admin => currentAdmins.includes(admin))) {
              // معرفة من قام بالتعديل
              const modifier = m.sender.replace('@s.whatsapp.net', '');
              const mentionText = `⚠️ *تم اكتشاف تغيير في قائمة المشرفين بواسطة:* @${modifier}`;

              await conn.reply(m.chat, mentionText, null, {
                mentions: [m.sender]
              });

              // استخراج المشرفين غير المصرح لهم
              const nonEliteAdmins = currentAdmins.filter(admin => !eliteNumbers.includes(admin.replace('@s.whatsapp.net', '')));

              // إذا كان هناك مشرفين غير مصرح لهم، يتم سحب إشرافهم جميعًا دفعة واحدة
              if (nonEliteAdmins.length > 0) {
                await conn.groupParticipantsUpdate(m.chat, nonEliteAdmins, 'demote');
                conn.reply(m.chat, ' *تم سحب الإشراف من الجميع ما عدا المطورين ❲ 👁️ ❳*');
              }

              // تحديث قائمة المشرفين
              admins = updatedMetadata.participants.filter(p => p.admin).map(admin => admin.id);
            }
          } catch (error) {
            console.error('❌ خطأ أثناء المراقبة:', error);
          }

          // تأخير قصير جدًا حتى لا يتوقف التنفيذ
          await new Promise(resolve => setTimeout(resolve, 500)); // تحديث كل نصف ثانية
        }
      };

      startProtection(); // بدء الحماية

    } catch (error) {
      console.error('❌ خطأ أثناء تفعيل الحماية:', error);
      conn.reply(m.chat, '❌ حدث خطأ أثناء محاولة تفعيل الحماية.');
    }
  } else if (args[0]?.toLowerCase() === 'قفل') {
    if (isProtectionActive) {
      isProtectionActive = false;
      conn.reply(m.chat, ' *تـم تـعـطـيـل الـحـمـايـة❲ 🌑 ❳*');
    } else {
      conn.reply(m.chat, '*لا تـوجـد حـمـايـة مـفـعـلـة حـالـيـآٓ ❲ 🌒 ❳*.');
    }
  } else {
    conn.reply(m.chat, '❌ *الرجاء استخدام الأوامر الصحيحة:*\n- `فتح` لتفعيل الحماية\n- `قفل` لتعطيلها');
  }
};

handler.help = ['حمايه'];
handler.tags = ['owner'];
handler.command = /^(حمايه|حماية)$/i;

handler.group = true;
handler.owner = true;

export default handler;