import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import moment from 'moment-timezone';
import mongoose from 'mongoose';

global.botnumber = ""
global.confirmCode = ""
global.authFile = 'Session';
global.linkedFile = 'Linked';
global.tmpFile = 'tmp';

global.defaultLenguaje = 'ar';
global.isBaileysFail = false

global.cuntryUrl = "https://drive.google.com/uc?export=download&id=18AjWHXAfMw0vroZYxtYsXdtzeOxiJTTt";

global.telegramToken = "8106888386:AAEATKyeGIOIg0rD2nigEcYnbeBmcdxJ0";

global.owner = [
  ['201101521761', '〘Developer〙', true],
  ['201006741515', '〘SUPER ADMIN〙', true],
  ['970569065576', '〘Owner〙', true],
  ['970599128320', '〘Owner〙', true],
  ['970569317014', '〘Owner〙', true],
  ['972538811876', '〘Owner〙', true],
];

// Super admin with all permissions
global.superOwner = ['201101521761', '201006741515'];

global.team = [
  ['201101521761', 'Lucas¹', true],
  ['201006741515', 'Lucas²', true],
]

global.ownername = 'Developer';
global.ownernumber = '201101521761';
global.ownerid = '201101521761@s.whatsapp.net';

global.rowner = [
  ['201101521761', 'Developer', true],
  ['201006741515', 'SUPER ADMIN', true],
  ['970569065576', 'Owner', true],
  ['970599128320', 'Owner', true],
  ['970569317014', 'Owner', true],
  ['972538811876', 'Owner', true],
];
global.registers = [];
global.suittag = ['212770083496'];
global.prems = ['212695157573'];
global.mods = ['970569317014'];

global.tmc = {};

global.postarIconUrl = ['https://files.catbox.moe/pi2y2v.jpg', 'https://files.catbox.moe/pi2y2v.jpg', 'https://files.catbox.moe/pi2y2v.jpg', 'https://files.catbox.moe/pi2y2v.jpg', 'https://files.catbox.moe/pi2y2v.jpg', 'https://files.catbox.moe/pi2y2v.jpg'];

global.postarIcon = postarIconUrl[Math.floor(Math.random() * postarIconUrl.length)];

global.packname = 'violet';
global.author = '𝙲𝙻𝙰𝚈-𝙱𝙾𝚃';
global.wm = '𝙲𝙻𝙰𝚈-𝙱𝙾𝚃';

global.wm3 = `
┌┤✑  Thanks for using Clay Bot
│└────────────┈ ⳹        
│©2020-2025 ⥳ Centre Clay ⥲
└─────────────────┈ ⳹`;

global.wait = '*Wait loading...*';
global.waiting = '*↝ Wait a minute...*';


global.channelId = ["120363367436260980@newsletter"];
global.channelName = ["⛊ 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 𝐒𝐔𝐏𝐏𝐎𝐑𝐓", "Hydra 𝐇𝐎𝐌𝐄", "⤿𝐇𝐎𝐌𝐄 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐂𝐋𝐀𝐘⤾", "⤳𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐂𝐋𝐀𝐘", "⊶ 𝐂𝐄𝐍𝐓𝐑𝐄 - 𝐂𝐋𝐀𝐘 ⊷"];
global.channelUrl = ["https://whatsapp.com/channel/0029Vb1oHBiI7BeKAWWNJo2C"];

global.randomchannelId = global.channelId[Math.floor(Math.random() * global.channelId.length)];
global.randomchannelName = global.channelName[Math.floor(Math.random() * global.channelName.length)];
global.randomchannelUrl = global.channelUrl[Math.floor(Math.random() * global.channelUrl.length)];

global.adsRandomChannel = {
  newsletterJid: global.randomchannelId,
  newsletterName: global.randomchannelName,
  serverMessageId: 100
};

global.adsAdReply = {
  title: '◈─┄┄┄┄┄┄〘 𝐇𝐎𝐌𝐄 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 〙┄┄┄┄┄┄─◈',
  body: '⎆┄┄┄┄〔 قنــاة الــدعم 〕┄┄┄┄⌲',
  sourceUrl: global.channelUrl,
  thumbnailUrl: global.postarIcon,
  mediaType: 1,
  renderLargerThumbnail: true
};

global.contextInfo = (mentioned, id, name, title, body, url, img, large = true) => {
  const contextInfo = {
    mentionedJid: mentioned,
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
      newsletterJid: id || global.randomchannelId,
      newsletterName: name || global.randomchannelName,
      serverMessageId: 100
    },
    externalAdReply: {
      title: title,
      body: body,
      sourceUrl: url || global.channelUrl,
      thumbnailUrl: img || global.postarIcon,
      mediaUrl: img || global.postarIcon,
      mediaType: 1,
      showAdAttribution: true,
      renderLargerThumbnail: large
    }
  }
  return contextInfo;
}

global.styel1 = '┌─ 〘 ';
global.styel2 = ' 〙 ─ ⳹';
global.styel3 = '│✑ 「 ';
global.styel4 = ' 」';
global.styel5 = '└┬ ✑ 「 ';
global.styel6 = '│✑ ';
global.styel7 = '「 ';

global.tx1 = '╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮';
global.tx2 = '│';
global.tx3 = '├';
global.tx4 = '┤';
global.tx5 = '───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───';
global.tx6 = '◈─┄┄┄┄〘';
global.tx7 = '〙┄┄┄┄─◈';
global.tx8 = '┄┄⋗';
global.tx9 = '├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤';
global.tx10 = '╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╯';




global.img1 = 'https://files.catbox.moe/pi2y2v.jpg';
global.img2 = 'https://files.catbox.moe/pi2y2v.jpg';
global.img3 = 'https://files.catbox.moe/pi2y2v.jpg';
global.img4 = 'https://files.catbox.moe/pi2y2v.jpg';
global.img5 = 'https://files.catbox.moe/pi2y2v.jpg';
global.img6 = 'https://files.catbox.moe/pi2y2v.jpg';

global.imagen1 = postarIconUrl[Math.floor(Math.random() * postarIconUrl.length)];

global.web = 'https://www.atom.bio/shawaza-2000/';


global.d = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
//new Date(new Date + 3600000);
global.locale = 'ar';

global.dia = d.toLocaleDateString(locale, { weekday: 'long' });
global.fecha = d.toLocaleDateString('ar', { day: 'numeric', month: 'numeric', year: 'numeric' });
global.mes = d.toLocaleDateString('ar', { month: 'long' });
global.año = d.toLocaleDateString('ar', { year: 'numeric' });
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

global.week = d.toLocaleDateString(locale, { weekday: 'long' });
global.day = d.toLocaleDateString('en', { day: '2-digit' });
global.month = d.toLocaleDateString(locale, { month: 'long' });
global.year = d.toLocaleDateString('en', { year: 'numeric' });
global.time = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });


global.wm2 = `© 𝙲𝙻𝙰𝚈-𝙱𝙾𝚃`;


global.nomorown = '212770083496';
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];

global.cmenut = '❖––––––『';
global.cmenub = '┊✦ ';
global.cmenuf = '╰━═┅═━––––––๑\n';
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ';
global.dmenut = '*❖─┅──┅〈*';
global.dmenub = '*┊»*';
global.dmenub2 = '*┊*';
global.dmenuf = '*╰┅────────┅✦*';
global.htjava = '⫹⫺';
global.htki = '*⭑•̩̩͙⊱•••• ☪*';
global.htka = '*☪ ••••̩̩͙⊰•⭑*';
global.comienzo = '• • ◕◕════';
global.fin = '════◕◕ • •';

global.ht1 = '*⋄━───═══⌬≼≽⌬═══───━⋄*';
global.ht2 = '*━────── • • ──────━*';
global.ht3 = '*━─────𖦹𖧷𖦹─────━*';

global.botdate = `*[ 📅 ] التاريخ :*  ${moment.tz('Africa/Cairo').format('DD/MM/YY')}`;
global.bottime = `*[ ⏳ ] الوقت :* ${moment.tz('Africa/Cairo').format('HH:mm:ss')}`;

global.fgif = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false }, message: { 'videoMessage': { 'title': wm, 'h': bottime, 'seconds': '', 'gifPlayback': 'true', 'caption': 'Welcom To Bot', 'jpegThumbnail': fs.readFileSync('./src/icon.png') } } };
global.fmsg = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false }, message: { conversation: 'فلسطين حرة مهما كان الثمن 🌙' } };
global.fcon = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, 'id': wm }, message: { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid= '212770083496@s.whatsapp.net':'212770083496@s.whatsapp.net'\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
global.fgif2 = { key: { participant: '0@s.whatsapp.net', ...('6289643739077-1613049930@g.us' ? { remoteJid: '6289643739077-1613049930@g.us' } : {}) }, message: { 'videoMessage': { 'title': '𝙲𝙻𝙰𝚈-𝙱𝙾𝚃', 'h': `Hmm`, 'seconds': '99999', 'gifPlayback': 'true', 'caption': '𝙲𝙻𝙰𝚈-𝙱𝙾𝚃', 'jpegThumbnail': false } } };
global.fgrp = { key: { participant: '0@s.whatsapp.net', remoteJid: '6289643739077-1613049930@g.us', fromMe: false, 'id': wm }, message: { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid= '212770083496@s.whatsapp.net':'212770083496@s.whatsapp.net'\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
global.floc = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false }, message: { locationMessage: { degreesLatitude: 37.7749, degreesLongitude: -122.4194, name: 'Palestine', address: 'San Francisco, CA, USA', url: 'https://maps.google.com/?q=37.7749,-122.4194' } } };
global.frol = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false }, message: { orderMessage: { itemCount: 2024, status: 1, thumbnail: 'https://telegra.ph/file/ba984d78fa802662438ee.jpg', surface: 1, message: wm, orderTitle: packname, sellerJid: '0@s.whatsapp.net' } } };

global.multiplier = 99;
global.flaaa = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=',
];



const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'config.js\''));
  import(`${file}?update=${Date.now()}`);
});