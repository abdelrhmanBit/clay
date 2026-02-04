const handler = (m) => m;

handler.all = async function (m) {
  let text = m.text;
  const chat = global.db.data.chats[m.chat];
  const fk = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  };

  if (!chat.isBanned) {
    if (m.quoted && m.quoted.sender === m.conn.user.jid) {
      if (text.includes('احا')) {
        const cap = [
          '*`❲ 👌🏻 ❳ احا لامك`*',
          '*`❲ 😒 ❳ احتين`*',
          '*`❲ 🤭 ❳ تاتي بعدها الشخره`*',
          '*`❲ 🙂 ❳ انت سافل`*'
        ][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });
      }
      
      if (text.includes('حبيبي')) {
        const cap = [
          '*`❲ 👌🏻 ❳ وانت حبيبي`*',
          '*`❲ 😒 ❳ حبك برص`*',
          '*`❲ 🤭 ❳ يتي يتي`*',
          '*`❲ 🙂 ❳ هنحك أهو`*'
        ][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });
      }
      
      if (text.includes('كسمك')) {
        const cap = [
          '*`❲ 👌🏻 ❳ كسمين امك`*',
          '*`❲ 😒 ❳ مكسمك يعم ولا تزعل`*',
          '*`❲ 🤭 ❳ كسمك أحلي`*',
          '*`❲ 🙂 ❳ ابويا نط قوق امك`*'
        ][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });
      }
      
      if (text.includes('خخخ')) {
        const cap = [
          '*`❲ 👌🏻 ❳ شخره لامك`*',
          '*`❲ 😒 ❳ جدع ي روح امك`*',
          '*`❲ 🤭 ❳ ي دكري`*',
          '*`❲ 🙂 ❳ انت سافل`*'
        ][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });
      }
      
      
    }
  }

  return true;
};

export default handler;