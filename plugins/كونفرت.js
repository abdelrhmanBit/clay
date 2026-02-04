import * as curlconverter from 'curlconverter';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text }) => {
  const curlCommand = (m.quoted?.text || text || '').trim();

  if (!curlCommand.startsWith('curl ')) {
    throw '✘ يرجى إدخال أمر curl صحيح أو الرد على رسالة تحتوي عليه.';
  }

  await m.reply('⏳ جارٍ تحويل امر curl ...');

  try {
    const axiosCode = curlconverter.toNodeAxios(curlCommand);
    const fetchCode = curlconverter.toNodeFetch(curlCommand);

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: '✓ اختر اانوع من تحت:' },
            footer: { text: global.wm },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'نسخ كود Axios',
                    copy_code: axiosCode,
                    id: 'btn-axios'
                  })
                },
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'نسخ كود Fetch',
                    copy_code: fetchCode,
                    id: 'btn-fetch'
                  })
                }
              ],
              messageParamsJson: ''
            }
          }
        }
      }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (error) {
    m.reply(`✘ خطأ أثناء التحويل:\n\n${error.message || error}`);
  }
};

handler.help = ['كونفرت'];
handler.tags = ['tools'];
handler.command = ['كونفرت'];
handler.owner = false;

export default handler;