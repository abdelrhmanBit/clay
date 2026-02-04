const handler = async (m, {isOwner, isAdmin, conn, text, participants, args, command, usedPrefix}) => {

  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }
  const pesan = args.join` `;
  
  
  let teks = `*٭ ﹝ مـــنــشــن جــمــاعــي ﹞٭ ↯*\n\n`;
  
  teks += `*┏┅ ━━━━━━━━━━━━━━━━ ┅ ━┣*\n*┃⧉↵ رســالــة: ${pesan}*\n*┣┅ ━━━━━━━━━━━━━━━━ ┅ ━┣*\n`;
  
  
  for (const mem of participants) {
    teks += `*┃↵ @${mem.id.split('@')[0]}*\n`;
  }
  teks += `*┗┅ ━━━━━━━━━━━━━━━━ ┅ ━┣*\n*𝐁𝐲 𝐓𝐡𝐞 𝐃𝐈𝐕𝐈𝐍𝐄-𝐁𝐎𝐓*\n\n*▌│█║▌║▌║║▌║▌║▌║█*`;
  
  conn.sendMessage(m.chat, {text: teks, mentions: participants.map((a) => a.id)} );
  
};
handler.help = ['tagall <mesaje>', 'invocar <mesaje>'];
handler.tags = ['group'];
handler.command = /^(منشن)$/i;
handler.admin = true;
handler.group = true;
export default handler;