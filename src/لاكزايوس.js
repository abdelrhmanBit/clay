import * as curlconverter from 'curlconverter';
import { prepareWAMessageMedia, generateWAMessageFromContent } from 'baileys';

const handler = async (m, { conn, text }) => {
  const curlCommand = (m.quoted?.text || text || '').trim();

  if (!curlCommand.startsWith('curl ')) {
    throw '❌ يجب إدخال أمر `curl` صالح أو الرد على رسالة تحتوي عليه.';
  }

  await m.reply('⏳ جارٍ تحويل أمر `curl` إلى كود `axios`...');

  try {
    const axiosCode = curlconverter.toNodeAxios(curlCommand);

    const codeMessage = `✅ تم التحويل بنجاح! اضغط الزر لنسخ الكود.`;

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: codeMessage },
            footer: { text: `${global.wm}` },
            header: {
              hasMediaAttachment: false
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'نسخ الكود',
                    copy_code: axiosCode,
                    id: 'copy-code-btn'
                  })
                }
              ],
              messageParamsJson: "",
            },
          },
        }
      }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (error) {
    m.reply(`❌ حدث خطأ أثناء التحويل:\n\n${error.message || error}`);
  }
};

handler.help = ['لاكزايوس'];
handler.tags = ['tools'];
handler.command = ['لاكزايوس'];
handler.owner = false;

export default handler;