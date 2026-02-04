/* 
• Plugins Film Finder ( Search Film ) 
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
*/

import axios from 'axios';

async function sfilm(tipe) {
    try {
        const sessid = Array.from({ length: 21 }, () =>
            'abcdefghijklmnopqrstuvwxyz0123456789'[
                Math.floor(Math.random() * 36)
            ]
        ).join('');

        const res = await axios.post('https://filmfinder.ai/api/main', {
            query: tipe,
            sessionId: sessid
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://filmfinder.ai/',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        return res.data;
    } catch (er) {
        throw new Error(er.message);
    }
}

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Contoh: .sfilm action');

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🎀',
                key: m.key
            }
        });

        const data = await sfilm(text);
        if (!data || !Array.isArray(data) || data.length === 0) {
            return conn.sendMessage(m.chat, { text: 'Tidak ada hasil ditemukan.' }, { quoted: m });
        }

        const hasil = data.slice(0, 10).map((film, i) => {
            return `*${i + 1}. ${film.title || 'Tanpa Judul'}* (${film.year || '-'})`;
        }).join('\n\n');

        await conn.sendMessage(m.chat, { text: hasil }, { quoted: m });
    } catch (err) {
        conn.sendMessage(m.chat, { text: `Gagal mengambil data.\n${err.message}` }, { quoted: m });
    }
};

handler.command = /^sfilm$/i;
handler.help = ['sfilm <genre atau judul>'];
handler.tags = ['film'];

export default handler;