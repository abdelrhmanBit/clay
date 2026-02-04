import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync, readFileSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {

  const language = global.db.data.users[m.sender]?.language;

  const langText = async (txt) =>
    typeof conn?.getTranslate === 'function'
      ? await conn.getTranslate(txt, language)
      : txt;
      
  let sessionPath, message;

  if (global.conn.user.jid !== conn.user.jid) {
    sessionPath = `./${global.linkedFile}/${conn.user.jid.split('@')[0]}/`;
    message = await conn.sendMessage(m.chat, {text: await langText('جارى تنظيف ملفات البوت الفرعي...')}, {quoted: m});
  } else {
    sessionPath = `./${global.authFile}/`;
    message = await conn.sendMessage(m.chat, {text: await langText('جارى تنظيف ملفات البوت الرئيسي...')}, {quoted: m});
  }
  
  try {
    if (!existsSync(sessionPath)) {
      return await conn.sendMessage(m.chat, { text: await langText('لا يوجد مجلد جلسة لتنظيفه.'), edit: message.key }, {quoted: m});
    }
    
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }

    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {text: await langText('لم يتم العثور على ملفات لحذفها.'), edit: message.key}, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {text: await langText(`تم حذف ${filesDeleted} ملف(ات).`), edit: message.key}, {quoted: m});
    }
  } catch (err) {
    console.error('خطأ في قراءة أو حذف ملفات الجلسة:', err);
    await conn.sendMessage(m.chat, {text: await langText('حدث خطأ أثناء محاولة حذف الملفات.'), edit: message.key}, {quoted: m});
  }

};

handler.help = ['تنظيف'];
handler.tags = ['owner'];
handler.command = ["تنظيف"];
handler.rowner = true;

export default handler;