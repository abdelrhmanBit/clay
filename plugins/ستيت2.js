import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*\uD83D\uDCCC الاستخدام:* ${usedPrefix + command} <معرف الجروب> (مع الرد على فيديو أو صورة أو صوت)`);
    
    let [id, ...captionParts] = text.split(' ');
    let caption = captionParts.join(' ');
    let mediaContent = null;
    let msgOptions = {};
    let Type = m.quoted ? m.quoted.mimetype : '';
    const BackgroundColor = ['#f68ac9', '#6cace4', '#f44336', '#4caf50', '#ffeb3b', '#9c27b0', '#0d47a1', '#03a9f4', '#9e9e9e', '#ff9800', '#000000', '#ffffff'];
    const pickedColor = BackgroundColor[Math.floor(Math.random() * BackgroundColor.length)];
    const jids = [m.sender, id];

    if (m.quoted && Type) {
        mediaContent = await m.quoted.download();
        const link = await uploadToCatbox(mediaContent);

        if (!link) {
            return m.reply('*❗ فشل في رفع الملف. يرجى المحاولة مرة أخرى.*');
        }

        if (Type.startsWith('image/')) {
            msgOptions = {
                image: { url: link },
                caption: caption || `*منورين الدنيا كلها  🐦❤️*`,
            };
        } else if (Type.startsWith('video/')) {
            msgOptions = {
                video: { url: link },
                caption: caption || `*منورين يا حلوين ♥️❤️*`,
            };
        } else if (Type.startsWith('audio/')) {
            msgOptions = {
                audio: { url: link },
                caption: caption || `*منورين يا حلوين ♥️❤️*`,
            };
        } else {
            return m.reply('*❗ نوع الوسائط غير مدعوم.*');
        }
    } else {
        return m.reply('*❗ يرجى الرد على صورة أو فيديو أو صوت.*');
    }

    try {
        await conn.sendMessage("status@broadcast", msgOptions, {
            backgroundColor: pickedColor,
            textArgb: 0xffffffff,
            font: 0,
            statusJidList: await (await conn.groupMetadata(id)).participants.map((a) => a.id),
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: jids.map((jid) => ({
                                tag: "to",
                                attrs: { jid: id },
                                content: undefined,
                            })),
                        },
                    ],
                },
            ],
        });
        m.reply("✅ *تم نشر الحالة بنجاح!* \n📌 *تحقق من الحالة الآن.*");
    } catch (error) {
        m.reply(`*❗ فشل في إرسال الحالة: ${error.message}*`);
    }
};

handler.help = ['tagsw'];
handler.tags = ['group'];
handler.command = /^(ستيت2)$/i;
handler.owner = true;

export default handler;

const uploadToCatbox = async (buffer) => {
    const { ext, mime: fileMime } = await fileTypeFromBuffer(buffer);
    const fileType = fileMime.split('/')[0];
    
    const form = new FormData();
    form.append('fileToUpload', buffer, `file.${ext}`);
    form.append('reqtype', 'fileupload'); 
    try {
        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form,
        });

        const text = await response.text(); 
        console.log('Response Text:', text); 

        if (text.startsWith('https://')) {
            return text; 
        } else {
            throw new Error('فشل في رفع الملف إلى Catbox: ' + text);
        }
    } catch (error) {
        throw new Error(`فشل في رفع الملف: ${error.message}`);
    }
};