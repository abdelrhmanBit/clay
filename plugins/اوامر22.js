import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, usedPrefix, command }) => {

  await conn.sendMessage(m.chat, { react: { text: '♻️', key: m.key } });


  const imagurl = 'https://files.catbox.moe/pi2y2v.jpg';

  let chname = '⛊  𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰';
  let chid = '120363316635505389@newsletter';

  // Use image instead of video for faster loading
  const mediaMessage = await prepareWAMessageMedia({ image: { url: imagurl } }, { upload: conn.waUploadToServer });

  await conn.sendMessage(m.chat, { react: { text: '💡', key: m.key } });

  const rows = [

    { header: '⌈ كــل الأقســام ⌋', title: "كــل الأقســام\n", description: 'قائمة كل الأوامر.', id: `${usedPrefix}ق` },
    { header: '⌈ قســم المطــور ⌋', title: "قســم المطــور\n", description: 'قائمة الاوامر الأساسية التي يستخدمها المطور.', id: `${usedPrefix}ق1` },
    { header: '⌈ قســم التحــويل ⌋', title: "قســم التحــويل\n", description: 'قائمة أوامر تحويل الملفات.', id: `${usedPrefix}ق2` },
    { header: '⌈ قســم التحــميل ⌋', title: "قســم التحــميل\n", description: 'قائمة أوامر تحميل الملفات.', id: `${usedPrefix}ق3` },
    { header: '⌈ قســم المجمــوعات ⌋', title: "قســم المجمــوعات\n", description: 'قائمة أوامر المجموعات.', id: `${usedPrefix}ق4` },
    { header: '⌈ قســم الترفيــه ⌋', title: "قســم الترفيــه\n", description: 'قائمة أوامر الترفيه والالعاب.', id: `${usedPrefix}ق5` },
    { header: '⌈ قســم الــادوات ⌋', title: "قســم الــادوات\n", description: 'قائمة أوامر الادوات.', id: `${usedPrefix}ق6` },
    { header: '⌈ قســم الاعــدادت ⌋', title: "قســم الاعــدادت\n", description: 'قائمة أوامر اعدادات البوت.', id: `${usedPrefix}ق8` }

  ];


  const readMore = String.fromCharCode(8206).repeat(850);

  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));

  const locale = 'ar';
  const week = d.toLocaleDateString(locale, { weekday: 'long' });
  const day = d.toLocaleDateString('en', { day: '2-digit' });
  const month = d.toLocaleDateString(locale, { month: 'long' });
  const year = d.toLocaleDateString('en', { year: 'numeric' });

  const time = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const uptime = clockString(process.uptime() * 1000);

  const sender = m.sender || '';
  const owner = ownerid || '';

  let sendername = await conn.getName(sender) || 'غير معروف';
  let ownername = await conn.getName(owner) || 'غير معروف';

  let sendernumber = m.sender.split('@')[0];

  const user = global.db.data.users[m.sender] || {};
  const {
    money = 0,
    joincount = 0,
    premiumTime = 0,
    exp = 0,
    diamond = 0,
    lastclaim,
    registered = false,
    regTime,
    age = 0,
    level = 0,
    role = 'غير محدد',
    warn = 0
  } = user;

  let { min, xp, max } = xpRange(level, global.multiplier);

  const rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
  const rtotal = Object.entries(global.db.data.users).length || '0';

  const tagowner = '@' + (owner || '').split('@')[0];
  const tagsender = '@' + (sender || '').split('@')[0];

  const isPrems = user.premiumTime > 0;

  const contactInfo = {
    key: {
      participants: `${sender}`,
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        displayName: `${sendername}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${sendername}\nitem1.TEL;waid=${sendernumber}:${sendernumber}\nEND:VCARD`
      }
    },
    participant: `${sender}`
  };


  const caption = `
*╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮*

*✑ مرحبا 「 ${sendername} 」*
*✑ اسمي 「 ${wm || 'غير معروف'} 」*
*✑ المطور 「 ${ownername} 」*
*✑ خاصه 「 ${tagowner} 」*
*✑ التاريخ 「 ${week} ${day}/${month}/${year} 」*
*✑ الوقت 「 ${time} 」*
*✑ التشغيل 「 ${uptime} 」*
*✑ المستخدمين 「 ${rtotal} 」*
*✑ المسجلين 「 ${rtotalreg} 」*

*◈〘 لا تنسي اضافه (.) قبل الأمر 〙┄┄⋗*

> ممنوع سب البوت لأنك إذا سببت البوت فإنك تسب المطور ، تمتع بالبوت ولا تكثر في ارسال رسائل للبوت ، وإذا كان لديك مشكله في استخدام البوت أو تريد أضافه أوامر جديده تواصل مع المطور .

*╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╯*
${readMore}

*╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮*

*│ الاسم: ${sendername}*
*│ المنشن: ${tagsender}*
*│ العمر: ${age}*
*│ مميز: ${isPrems ? 'نعم' : 'لا'}*
*│ مسجل: ${registered ? 'نعم' : 'لا'}*
*│ وقت التسجيل: ${registered ? new Date(regTime).toLocaleDateString(locale) : 'غير مسجل'}*
*│ المستوي: ${level}*
*│ اللقب: ${role}*
*│ العملات: ${money}*
*│ الكوينز: ${joincount}*
*│ الألماس: ${diamond}*
*│ النقاط: ${exp}*
*│ التحذيرات: ${warn}*
*│ اخر مطالبة: ${lastclaim ? new Date(lastclaim).toLocaleDateString(locale) : 'لا يوجد'}*
*│ نقاط المستوى: ${xp} من ${min} إلى ${max}*

*╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───╯*
`.trim();


  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: caption },
          footer: { text: wm },
          header: {
            hasMediaAttachment: true,
            imageMessage: mediaMessage.imageMessage
          },
          contextInfo: {
            mentionedJid: await conn.parseMention(caption),
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
              newsletterJid: chid,
              newsletterName: chname,
              serverMessageId: 100
            },
            externalAdReply: {
              showAdAttribution: true,
              title: "⋄┄〘 القائمــة 🗃️ 〙┄⋄",
              body: "❲ القائمــة الرئيسيــة ❳",
              thumbnailUrl: imagurl,
              mediaUrl: imagurl,
              mediaType: 2,
              sourceUrl: 'https://www.atom.bio/shawaza-2000/',
              renderLargerThumbnail: false
            }
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '〘 قــائــمــة الاقــسام 〙',
                  icon: '🗃️',
                  sections: [
                    {
                      title: '「 🗃️ الاقــسام 」',
                      highlight_label: '📑',
                      rows: rows
                    }
                  ]
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '〘 الدعــم 〙',
                  url: 'https://www.atom.bio/shawaza-2000/',
                  merchant_url: 'https://www.atom.bio/shawaza-2000/'
                })
              }
            ]
          }
        }
      }
    }
  }, { userJid: conn.user.jid, quoted: contactInfo });

  await conn.sendMessage(m.chat, { react: { text: '🗃️', key: m.key } });

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

};
handler.help = ['menu', 'listmenu'];
handler.tags = ['menu'];
handler.command = /^(اوامر|الاوامر)$/i;

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function xpRange(level, multiplier) {
  const min = level * level * 100;
  const max = (level + 1) * (level + 1) * 100;
  const xp = multiplier * level;
  return { min, xp, max };
}