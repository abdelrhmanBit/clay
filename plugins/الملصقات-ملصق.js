import { sticker } from '../libraries/sticker.js';
import uploadFile from '../libraries/uploadFile.js';
import uploadImage from '../libraries/uploadImage.js';
import { webp2png } from '../libraries/webp2mp4.js';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  
  
  // النصوص العربية
  const textoErrorDownload = 'يجب عليك الرد على صورة أو فيديو.';
  const textoErrorUrl = 'يرجى إدخال رابط صحيح للصورة أو الفيديو.';
  const textoErrorUnknown = 'حدث خطأ أثناء معالجة الملصق. حاول مرة أخرى.';

  if (usedPrefix === 'a' || usedPrefix === 'A') return;
  let stiker = false;
  const user = db.data.users[m.sender];
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    const metadata = {
      isAiSticker: true
    };

    if (/webp|image|video/g.test(mime)) {
      const img = await q.download?.();
      if (!img) throw textoErrorDownload;
      let out;
      try {
        stiker = await sticker(img, false, global.packname, global.author, ["✨"], metadata);
      } catch (e) {
        console.error(e);
      } finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img);
          else if (/image/g.test(mime)) out = await uploadImage(img);
          else if (/video/g.test(mime)) out = await uploadFile(img);
          if (typeof out !== 'string') out = await uploadImage(img);
          stiker = await sticker(false, out, global.packname, global.author, ["✨"], metadata);
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], global.packname, global.author, ["✨"], metadata);
      } else {
        return m.reply(`${textoErrorUrl} مثال: ${usedPrefix + command} https://telegra.ph/file/0dc687c61410765e98de2.jpg`);
      }
    }
  } catch (e) {
    console.error(e);
    if (!stiker) stiker = e;
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    } else {
      return m.reply(textoErrorUnknown + ` ${usedPrefix + command}`);
    }
  }
};

handler.help = ['sfull'];
handler.tags = ['sticker'];
handler.command = /^ملصق$/i;

export default handler;

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'));
};

async function createSticker(img, url, packName, authorName, quality) {
  let stickerMetadata = { type: 'full', pack: packName, author: authorName, quality };
  return (new Sticker(img ? img : url, stickerMetadata)).toBuffer();
}

async function mp4ToWebp(file, stickerMetadata) {
  if (stickerMetadata) {
    if (!stickerMetadata.pack) stickerMetadata.pack = '‎';
    if (!stickerMetadata.author) stickerMetadata.author = '‎';
    if (!stickerMetadata.crop) stickerMetadata.crop = false;
  } else if (!stickerMetadata) { 
    stickerMetadata = { pack: '‎', author: '‎', crop: false }; 
  }
  
  let getBase64 = file.toString('base64');
  const Format = {
    file: `data:video/mp4;base64,${getBase64}`, 
    processOptions: { crop: stickerMetadata?.crop, startTime: '00:00:00.0', endTime: '00:00:7.0', loop: 0 }, 
    stickerMetadata: { ...stickerMetadata }, 
    sessionInfo: { 
      WA_VERSION: '2.2106.5', 
      PAGE_UA: 'WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36', 
      WA_AUTOMATE_VERSION: '3.6.10 UPDATE AVAILABLE: 3.6.11', 
      BROWSER_VERSION: 'HeadlessChrome/88.0.4324.190', 
      OS: 'Windows Server 2016', 
      START_TS: 1614310326309, 
      NUM: '6247', 
      LAUNCH_TIME_MS: 7934, 
      PHONE_VERSION: '2.20.205.16' 
    }, 
    config: { 
      sessionId: 'session', 
      headless: true, 
      qrTimeout: 20, 
      authTimeout: 0, 
      cacheEnabled: false, 
      useChrome: true, 
      killProcessOnBrowserClose: true, 
      throwErrorOnTosBlock: false, 
      chromiumArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache', '--disable-offline-load-stale-cache', '--disk-cache-size=0'], 
      executablePath: 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe', 
      skipBrokenMethodsCheck: true, 
      stickerServerEndpoint: true 
    } 
  };
  
  let res = await fetch('https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl', { 
    method: 'post', 
    headers: { 
      Accept: 'application/json, text/plain, /', 
      'Content-Type': 'application/json;charset=utf-8', 
    }, 
    body: JSON.stringify(Format) 
  });
  
  return Buffer.from((await res.text()).split(';base64,')[1], 'base64');
}