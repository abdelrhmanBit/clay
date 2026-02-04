let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0] || !m.mentionedJid || m.mentionedJid.length === 0) {
        throw `✳️ قم باستخدام الأمر مع منشن العضو مثل: ${usedPrefix + command} @العضو`;
    }

    const chatId = m.chat;
    const mentioned = m.mentionedJid[0];

    if (!global.groupData) {
        global.groupData = {};
    }

    if (!global.groupData[chatId]) {
        global.groupData[chatId] = { mutedUsers: {} };
    }

    const groupData = global.groupData[chatId];

    if (!groupData.mutedUsers) {
        groupData.mutedUsers = {};
    }

    if (command === 'كتم') {
        // إضافة العضو إلى قائمة المكتمين
        groupData.mutedUsers[mentioned] = true;
        m.reply(`✅ تم كتم العضو @${mentioned.split('@')[0]}!`, null, {
            mentions: [mentioned]
        });
    } else if (command === 'فك') {
        // إزالة العضو من قائمة المكتمين
        if (groupData.mutedUsers[mentioned]) {
            delete groupData.mutedUsers[mentioned];
            m.reply(`✅ تم فك الكتم عن العضو @${mentioned.split('@')[0]}!`, null, {
                mentions: [mentioned]
            });
        } else {
            m.reply(`⚠️ العضو @${mentioned.split('@')[0]} غير مكتوم أصلاً.`, null, {
                mentions: [mentioned]
            });
        }
    }
};

// مراقبة الرسائل وحذفها بشكل فوري
handler.all = async (m) => {
    const chatId = m.chat;
    if (!global.groupData || !global.groupData[chatId]) return;

    const groupData = global.groupData[chatId];
    const mutedUsers = groupData.mutedUsers || {};

    // تحقق من قائمة المكتمين
    if (mutedUsers[m.sender]) {
        try {
            // حذف الرسالة المرسلة
            await conn.sendMessage(m.chat, { delete: m.key });

            // إذا كانت الرسالة متكررة بسرعة، حذف جميع الرسائل المحتملة
            if (m.message.extendedTextMessage) {
                const participant = m.message.extendedTextMessage.contextInfo.participant;
                const stanzaId = m.message.extendedTextMessage.contextInfo.stanzaId;

                // حذف الرسائل المقتبسة (إن وجدت)
                await conn.sendMessage(m.chat, {
                    delete: { remoteJid: m.chat, fromMe: false, id: stanzaId, participant },
                });
            }
        } catch (err) {
            console.error("⚠️ خطأ في حذف الرسالة:", err);
        }
    }
};

handler.command = ['كتم', 'فك']; // أوامر الكتم وفك الكتم
handler.help = ['كتم @العضو', 'فك @العضو'];
handler.tags = ['group'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;