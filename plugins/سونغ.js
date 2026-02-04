import axios from 'axios';

async function handler(m, { conn, participants }) {
  if (!m.isGroup) return;

  const botNumber = conn.user.jid;
  const botInfo = participants.find(p => p.id === botNumber);
  const botIsAdmin = botInfo?.admin === 'admin' || botInfo?.admin === 'superadmin';

  if (!botIsAdmin) return m.reply('❌ يجب أن يكون البوت مشرفًا لإجراء هذه التعديلات!');

  // Get developers from global.owner
  // global.owner format is usually [[number, name, isCreator], ...]
  // We filter for active/true ones if needed, or just take the numbers.
  // We need to format them as JIDs.
  const botDevelopers = global.owner
    .map(([number]) => number?.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .filter(jid => jid && jid !== '@s.whatsapp.net'); // Basic validation

  // List of participants to demote
  // Everything that is admin, NOT valid developer, NOT the bot itself
  const participantsToDemote = participants
    .filter(p => (p.admin === 'admin' || p.admin === 'superadmin') &&
      !botDevelopers.includes(p.id) &&
      p.id !== botNumber)
    .map(p => p.id);

  // 1. Demote non-developers
  if (participantsToDemote.length > 0) {
    try {
      await conn.groupParticipantsUpdate(m.chat, participantsToDemote, 'demote');
    } catch (e) {
      console.error('❌ خطأ في تخفيض الأعضاء:', e);
      // Continue anyway
    }
  }

  // 2. Add/Promote Developers
  let promoted = [];
  const promotionPromises = botDevelopers.map(async (dev) => {
    const devInGroup = participants.find(p => p.id === dev);

    try {
      if (!devInGroup) {
        // Developer not in group -> Add then Promote
        // Note: Adding might fail if they have privacy settings
        await conn.groupParticipantsUpdate(m.chat, [dev], 'add');
        await conn.groupParticipantsUpdate(m.chat, [dev], 'promote');
        promoted.push(dev);
      } else if (!devInGroup.admin) {
        // Developer in group but not admin -> Promote
        await conn.groupParticipantsUpdate(m.chat, [dev], 'promote');
        promoted.push(dev);
      } else {
        // Already admin/superadmin
        // promoted.push(dev); // Uncomment if we want to list them even if already admin
      }
    } catch (err) {
      console.error(`❌ فشل في إضافة/ترقية ${dev}:`, err);
    }
  });

  await Promise.all(promotionPromises);

  if (promoted.length > 0) {
    const mentions = promoted.map(num => `@${num.split('@')[0]}`).join('\n');
    await m.reply(`✅ تم إضافة/ترقية المطورين:\n${mentions}`, null, { mentions: promoted });
  } else {
    // Optional: Notify if no one needed promotion
    // m.reply('⚠️ المطورون موجودون بالفعل ومشرفون.'); 
  }

  // 3. Update Group Metadata (Parallelize image and text updates)
  const updates = [];

  // Image Update
  updates.push((async () => {
    try {
      const imgUrl = 'https://files.catbox.moe/b3jfwb.jpg';
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      if (response.status === 200) {
        await conn.updateProfilePicture(m.chat, Buffer.from(response.data));
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل أو تحديث الصورة:', error);
    }
  })());

  // Subject and Description Update
  updates.push((async () => {
    try {
      await conn.groupUpdateSubject(m.chat, 'مزروف 𝐶𝐿𝐴𝑌');
      await conn.groupUpdateDescription(
        m.chat,
        `*تـم زرفـكـم مـن 𝐶𝐿𝐴𝑌┇♦️*
*┇وما الحياة الدنيا إلا متاع الغرور ☕︎*
*◈≼━⊹══━━━〔♦️〕━━━══⊹━≽◈*

*اللي زرفوكم:*

*⚠︎-* CI"Song...𖤝

*⚠︎-*

*⚠︎-*

*◈≼━⊹══━━━〔♦️〕━━━══⊹━≽◈*

*CLAY Channel ➪*
〔 https://whatsapp.com/channel/0029VardcExCMY0ARamUwp0Y 〕
*رابط الشات:*
〔 https://chat.whatsapp.com/Hngojz8isTw10uHesXwhmn 〕
*◈≼━⊹══━━━〔♦️〕━━━══⊹━≽◈*

*لا تزعل إنك انزرفت… افتخر إن اللي زرفوك هم 𝐶𝐿𝐴𝑌*`
      );
    } catch (e) {
      console.error('❌ خطأ في تحديث اسم أو وصف المجموعة:', e);
    }
  })());

  await Promise.all(updates);
}

handler.help = ['adminsetup'];
handler.tags = ['group'];
handler.command = ['سونغ'];
handler.group = true;
// handler.owner = true; // Typically such powerful commands are owner-only
handler.rowner = true;   // More secure: Real Owner only
handler.botAdmin = true;

export default handler;