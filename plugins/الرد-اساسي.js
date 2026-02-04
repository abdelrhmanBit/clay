import fs from 'fs';
import fetch from 'node-fetch';

const handler = (m) => m;
handler.all = async function (m) {
  let text = m.text;
  let cap;
  const chat = global.db.data.chats[m.chat];
  const isPrivate = m.chat.endsWith('whatsapp.net');
  const fk = {
    'key': {
      'participants': '0@s.whatsapp.net',
      'remoteJid': 'status@broadcast',
      'fromMe': false,
      'id': 'Halo'
    },
    'message': {
      'contactMessage': {
        'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    'participant': '0@s.whatsapp.net'
  };

  if (!chat.isBanned) {

    if (text.startsWith('ستيتش')) {
      const [cm, ...rest] = text.split(' ');
      const qu = rest.join(' ');
      const qy = m.quoted;

      const query = (qy && qy.sender === m.conn.user.jid)
        ? `ده كان ردك يا رمسيس: ${qy.text}\nوده سؤال المستخدم: ${qu}`
        : qu;

      if (query) {

        cap = await ramses(query);
        m.conn.sendMessage(m.chat, { text: cap, ai: isPrivate ? true : false }, { quoted: fk });

      } else {

        const username = conn.getName(m.sender);

        const img = 'https://files.catbox.moe/pi2y2v.jpg';

        const cap = '\n\n*`⛊ مرحبا: ❲ ' + username + ' ❳`*\n\n*`⛊ انا: ❲ ' + wm + ' ❳`*\n\n> 🗃️ *`معلوماتي:`*\n\n- *`◉📑 الاوامر:`* لعرض قائمة اوامري \n\n- *`◉💻 المطور:`* للتواصل مع مطوري\n\n';

        m.conn.sendButton(m.chat, cap, wm, img, [['❲ الاوامــر ❳', '.اوامر'], ['❲ المطــور ❳', '.مطور']], null, null, fk);

      }

    } else if (text.startsWith('نخنوخ')) {
      const [cm, ...rest] = text.split(' ');
      const qu = rest.join(' ');
      const qy = m.quoted;

      const query = (qy && qy.sender === m.conn.user.jid)
        ? `ده كان ردك يا معلم: ${qy.text}\nوده سؤال الزبون: ${qu}`
        : qu;

      if (query) {
        cap = await nahnoh(query, m.sender);
        const voice = await toVoiceBoy(cap.trim());
        if (voice) {
          const audio = {
            audio: { url: voice },
            mimetype: 'audio/mpeg',
            ptt: true,
            ai: isPrivate ? true : false
          };
          m.conn.sendMessage(m.chat, audio, { quoted: fk });
        } else {
          m.conn.sendMessage(m.chat, { text: cap, ai: isPrivate ? true : false }, { quoted: fk });
        }
      }

    } else if ('تست' === text) {

      cap = ['*`❲ 🌙 ❳ شغال`*', '*`❲ 🙂 ❳ شغلانه هي مقولنا شغال`*', '*`❲ 🫦 ❳ هات بوسه`*', '*`❲ 🙂 ❳ انت شايف ايه`*'][Math.floor(Math.random() * 4)];

      m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });


    } else if (text.startsWith('بوت')) {
      const [cm, ...rest] = text.split(' ');
      const qu = rest.join(' ');
      const qy = m.quoted;

      const query = (qy && qy.sender === m.conn.user.jid)
        ? `ده كان ردك يا معلم: ${qy.text}\nوده سؤال الزبون: ${qu}`
        : qu;

      if (query) {
        cap = await ramses(query);

        m.conn.sendMessage(m.chat, { text: cap, ai: isPrivate ? true : false }, { quoted: fk });

      } else {
        cap = ['*`❲ 🌙 ❳ اسمي ستيتش`*', '*`❲ 🙂 ❳ شايفنى شبهك`*', '*`❲ 🫦 ❳ معاك`*', '*`❲ 🙂 ❳ ليا اسم زيك`*'][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap, ai: isPrivate ? true : false }, { quoted: fk });
      }
    } else if (['صباح الخير', 'صباحو', 'صحيت'].includes(text)) {

      cap = ['*`❲ ☀️ ❳ صباحو ابيض`*', '*`❲ 🫦 ❳ صحي النوم`*', '*`❲ 🌒 ❳ القمر صحي`*', '*`❲ 🙂 ❳ صباح الزفت`*'][Math.floor(Math.random() * 4)];

      m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });

    } else if (text.startsWith('ساره')) {
      const [cm, ...rest] = text.split(' ');
      const qu = rest.join(' ');
      const qy = m.quoted;

      const query = (qy && qy.sender === m.conn.user.jid)
        ? `ده كان ردك يا ساره: ${qy.text}\nوده سؤال المستخدم: ${qu}`
        : qu;

      const pompart = `
  أنتي مساعده ذكيه اسمك ساره.
  انتي أحد اصدارات فريق the end .
  تم صنعك بواسطهMohamed .
  أنتي مساعد ذكي ومرح .
  لديكي حس فكاهي .
  تتكلمي باللهجة المصرية الشعبية .
  `.trim();

      if (query) {
        cap = await ramses(query, pompart);

        const voice = await toVoiceGirl(cap.trim());
        if (voice) {
          const audio = {
            audio: { url: voice },
            mimetype: 'audio/mpeg',
            ptt: true,
            ai: isPrivate ? true : false
          };
          m.conn.sendMessage(m.chat, audio, { quoted: fk });
        } else {
          m.conn.sendMessage(m.chat, { text: cap, ai: isPrivate ? true : false }, { quoted: fk });
        }

      } else {
        cap = ['*`❲ 🫦 ❳ اطلب يا حبيبي`*', '*`❲ 😒 ❳ مستنيه طلبك`*', '*`❲ 🫀 ❳ ساره بتحبك`*', '*`❲ 🙂 ❳ مخصماك`*'][Math.floor(Math.random() * 4)];

        m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });
      }
    } else if (['صباح الخير', 'صباحو', 'صحيت'].includes(text)) {

      cap = ['*`❲ ☀️ ❳ صباحو ابيض`*', '*`❲ 😒 ❳ صحي النوم`*', '*`❲ 🌒 ❳ القمر صحي`*', '*`❲ 🙂 ❳ صباح الزفت`*'][Math.floor(Math.random() * 4)];

      m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk }); o

    } else if (['مسا الخير', 'مساء الخير'].includes(text)) {

      cap = ['*`❲ 👌🏻 ❳ ليله سعيده`*', '*`❲ 😒 ❳ روح نام`*', '*`❲ 🤭 ❳ القمر ظهر`*', '*`❲ 🙂 ❳ مسا الزفت`*'][Math.floor(Math.random() * 4)];

      m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });

    } if ('نعم' === text) {

      cap = ['*`❲ 👌🏻 ❳ انعم الله عليك`*', '*`❲ 😒 ❳ حد نداك`*', '*`❲ 🤭 ❳ يختى عليها`*', '*`❲ 🙂 ❳ يدكرى`*'][Math.floor(Math.random() * 4)];

      m.conn.sendMessage(m.chat, { text: cap }, { quoted: fk });

    }

  }


  return !0;
};
export default handler;

async function ramses(question, pompart = `
  أنت بوت واتساب أسمك هو رمسيس.
  أنت أحد اصدارات فريق the end .
  تم صنعك بواسطه Mohamed .
  أنت مساعد ذكي ومرح .
  لديك حس فكاهي .
  تتكلم باللهجة المصرية الشعبية .
  `.trim()) {

  const url = `http://stitch-api.vercel.app/api/v2/sections/Ai/Bot?q=${encodeURIComponent(question)}&pompart=${encodeURIComponent(pompart)}`;
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
}

async function nahnoh(question, user) {
  const url = `http://stitch-api.vercel.app/api/v2/sections/Ai/Naghnog?q=${encodeURIComponent(question)}&user=${user}&key=2000`;
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
}

async function toVoiceBoy(text) {
  let data = await (await fetch(`https://stitch-api.vercel.app/api/v2/sections/Ai/text2speech/elevenlabs?q=${encodeURIComponent(text)}&gender=male&name=Liam`)).json();

  if (data.data) {
    return data.data;
  } else {
    return null;
  }
}

async function toVoiceGirl(text) {
  let data = await (await fetch(`https://stitch-api.vercel.app/api/v2/sections/Ai/text2speech/elevenlabs?q=${encodeURIComponent(text)}&gender=female&name=Sarah`)).json();

  if (data.data) {
    return data.data;
  } else {
    return null;
  }
}