import fs from 'fs';
import path from 'path';

const handler = async (m, { text, usedPrefix, command }) => {
  const q = m.quoted || m;
  const mime = q.mimetype || '';
  const isTextMessage = q.text;
  let filePath = text || '';
  let isAdd = false;
  let isDel = false;
  let isGet = false;

  let fileContent = '';

  switch (command) {
    case 'ميك-دير':
      if (!q || (!isTextMessage && !mime)) {
        throw `〘 ❗ 〙 يرجى الرد على رسالة نصية أو مستند ليتم حفظه كملف`;
      }

      try {
        if (!filePath && q.fileName) {
          filePath = q.fileName;
        } else if (!filePath) {
          throw `〘 ❗ 〙 يرجى تحديد مسار الملف أو الرد على ملف`;
        }

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (isTextMessage) {
          fileContent = isTextMessage.trim();
          if (!fileContent) throw `〘 ❗ 〙 النص المستلم فارغ.`;
          fs.writeFileSync(filePath, fileContent, 'utf8');
          isAdd = true;
        } else {
          const buffer = await q.download();
          fileContent = buffer.toString('utf8');
          if (!fileContent.trim()) throw `〘 ❗ 〙 الملف المرفق فارغ أو لا يحتوي على نصوص صالحة.`;
          fs.writeFileSync(filePath, fileContent, 'utf8');
          isAdd = true;
        }
      } catch (error) {
        throw `〘 ❗ 〙 حدث خطأ أثناء حفظ الملف: ${error.message || error}`;
      }
      break;

    case 'ان-دير':
      if (!filePath) throw `〘 ❗ 〙 يرجى تحديد مسار الملف`;
      if (!fs.existsSync(filePath)) {
        throw `〘 ❗ 〙 الملف "${filePath}" غير موجود لحذفه`;
      }

      try {
        fs.unlinkSync(filePath);
        
        const dir = path.dirname(filePath);
        if (fs.readdirSync(dir).length === 0 && dir !== '.') {
          fs.rmdirSync(dir);
        }
        
        isDel = true;
      } catch (error) {
        throw `〘 ❗ 〙 حدث خطأ أثناء حذف الملف: ${error.message || error}`;
      }
      break;

    case 'هات-دير':
      if (!filePath) throw `〘 ❗ 〙 يرجى تحديد مسار الملف`;
      if (!fs.existsSync(filePath)) {
        throw `〘 ❗ 〙 الملف "${filePath}" غير موجود`;
      }

      try {
        fileContent = fs.readFileSync(filePath, 'utf8');
        isGet = true;
      } catch (error) {
        throw `〘 ❗ 〙 حدث خطأ أثناء قراءة الملف: ${error.message || error}`;
      }
      break;

    default:
      throw `〘 ❗ 〙 الأمر غير معروف
      استخدم أحد الأوامر التالية:
      - ${usedPrefix}ميك-دير <مسار الملف> (مع الرد على المحتوى)
      - ${usedPrefix}ان-دير <مسار الملف>
      - ${usedPrefix}هات-دير <مسار الملف>`;
  }

  if (isAdd) {
    m.reply(`〘 ✅ 〙 تم حفظ الملف بنجاح: "${filePath}"`);
  } else if (isDel) {
    m.reply(`〘 ✅ 〙 تم حذف الملف بنجاح: "${filePath}"`);
  } else if (isGet) {
    m.reply(fileContent);
  }
};

handler.help = ['ميك-دير', 'ان-دير', 'هات-دير'];
handler.tags = ['owner'];
handler.command = ['ميك-دير', 'ان-دير', 'هات-دير'];
handler.owner = true;

export default handler;