import fetch from 'node-fetch';
import yts from 'yt-search';

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '> ايش بدك اغنيه 🌑 𝑪𝑳𝑨𝒀-𝑩𝑶𝑻 ', m);

    try {
        // إرسال تفاعل الانتظار
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

        // البحث عن الفيديو
        let searchResults = await yts(text);
        if (!searchResults.videos.length) {
            return conn.reply(m.chat, '> مافي اغنيه يزم 🌑𝙲𝙻𝙰𝚈-𝙱𝙾𝚃 ', m);
        }

        let video = searchResults.videos[0]; // أول نتيجة
        let videoUrl = video.url;

        // إرسال معلومات الفيديو
        let caption = `*┓━━━━━━⟬🌙⟭━━━━━━┏*\n*العنوان 🔖:-*\n> *${video.title}*\n*المده⏳:-*\n> *${video.timestamp}*\n*الرابط ⛓‍💥:-*\n> *${videoUrl}*\n*يرجى الانتظار جاري ارسال الاغنيه🌘*\n*┛━━━━━━⟬🌙⟭━━━━━━┗*`;

        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption
        });

        // تفاعل جاري التحميل
        await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

        // تحميل رابط الصوت
        const apiUrl = `https://bk9.fun/download/ytmp3?url=${encodeURIComponent(videoUrl)}&type=mp3`;
        const response = await fetch(apiUrl);

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            let errorText = await response.text();
            throw new Error(`❌ 🌘 *خطأ في API:*\n${errorText}`);
        }

        console.log('🔍 استجابة API:', JSON.stringify(result, null, 2));

        if (!result.status || !result.BK9 || !result.BK9.downloadUrl) {
            throw new Error(`❌ ،🌘 لم يتم العثور على رابط تحميل الصوت.\n🔍 *استجابة API:* ${JSON.stringify(result, null, 2)}`);
        }

        const audioUrl = result.BK9.downloadUrl;
        let user = m.sender;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            contextInfo: {
                mentionedJid: [user],
                externalAdReply: {
                    thumbnail: null,
                    title: ".•♫•♬• 𝐂𝐋𝐀𝐘 「🎧」𝑩𝒐𝒕 •♬•♫•.",
                    body: "",
                    previewType: "PHOTO",
                    thumbnailUrl: null,
                    showAdAttribution: true,
                    sourceUrl: videoUrl
                }
            },
            ptt: true,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ 🌑 *خطأ:* ${error.message}`);
    }
};

handler.tags = ['اغنيه'];
handler.help = ['اغنيه'];
handler.command = ['اغنيه'];

export default handler;