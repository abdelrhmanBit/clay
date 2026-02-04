import { addExif } from '../libraries/sticker.js';

let handler = async (m, { conn, text }) => {

if (!m.quoted) throw '*`قم بالرد على الملصق الذي تريد إضافة حزمة إليه`*';

let stiker = false;
const metadata = {
      isAiSticker: true
    };
    
try {

let [packname, ...author] = text.split('|');
author = (author || []).join('|');

let mime = m.quoted.mimetype || '';
if (!/webp/.test(mime)) throw '*قم بالرد على الملصق الذي تريد إضافة حزمة إليه*';

let img = await m.quoted.download()
if (!img) throw '*امنح الملصق الذي تريده لإضافة حزمة واسم*'
const tauthor =`
╭───┄┄┄┄┄───╮

│ by: ${author || global.author}

│ ⎙ The Sticker ⌲

│ use: ${global.wm}

╰───┄┄┄┄┄┄──╯
`.trim();
const tpackname = `
╭───┄┄┄┄┄───╮

│ name: ${packname || global.packname}

│ ⎙ The Sticker ⌲

│ owner: ${global.packname}

╰───┄┄┄┄┄┄──╯
`.trim();

stiker = await addExif(img, tpackname, tauthor, ["✨"], metadata);

} catch (e) {
console.error(e)
if (Buffer.isBuffer(e)) stiker = e;

} finally {

if (stiker) {
conn.sendFile(m.chat, stiker, 'wm.webp', '', m);

} else { 
throw '*آسف ، شيء ما خاطئ ..تحقق من أنك استجابت لملصق وأضفت اسم حزمة واسم حزمة*';
}

}

};

handler.help = ['wm <packname>|<author>']
handler.tags = ['sticker']
handler.command = ['سرقة','حقوق','سرقه'];
export default handler