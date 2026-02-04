import uploadImage from '../libraries/uploadImage.js';
import { sticker } from '../libraries/sticker.js';
import MessageType from "@whiskeysockets/baileys";

const effects = ['jail', 'gay', 'glass', 'wasted', 'triggered', 'lolice', 'simpcard', 'horny'];

const handler = async (m, { conn, usedPrefix, command, text }) => {
  
  
  const effect = text.trim().toLowerCase();
  if (!effects.includes(effect)) {
    throw `
عذراً، التأثير المطلوب غير موجود.
يرجى استخدام الأمر التالي:
${usedPrefix + command} <effect>
التأثيرات المتاحة هي:
${effects.map((effect) => `_> ${effect}_`).join('\n')}
`.trim();
  }

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw 'يجب عليك الرد على صورة.';
  if (!/image\/(jpe?g|png)/.test(mime)) throw 'الرجاء إرسال صورة بصيغة JPEG أو PNG.';

  const img = await q.download();
  const url = await uploadImage(img);
  const apiUrl = global.API('https://some-random-api.com/canvas/', encodeURIComponent(effect), {
    avatar: url,
  });

  try {
    const stiker = await sticker(null, apiUrl, global.packname, global.author);
    conn.sendFile(m.chat, stiker, null, { asSticker: true });
  } catch (e) {
    m.reply('حدث خطأ أثناء إنشاء الملصق. إليك الصورة الناتجة:');
    await conn.sendFile(m.chat, apiUrl, 'image.png', null, m);
  }
};

handler.help = ['stickmaker (caption|reply media)'];
handler.tags = ['General'];
handler.command = /^(ستيك)$/i;

export default handler;