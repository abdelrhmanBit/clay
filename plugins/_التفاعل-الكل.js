export async function before(m, { conn, isStory, isChannel, isPrivate, isGroup }) {
    
    const emojj = '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️';
    const emojj2 = '❤️';
    
    const emojis = [
    '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️', 
    '♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️',
    '🫂❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️'
    ];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)] || emojj;
    
    const emojis2 = [
    '❤️', '✨',
    '♥️', '💕',
    '🫂', '🌹',
    '👀', '💀',
    '🔥', '🙂',
    '😂', '🤖',
    ];
    
    const randomEmoji2 = emojis2[Math.floor(Math.random() * emojis2.length)] || emojj2;
    
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const bot = global.db.data.settings[this.user.jid];
    
    if (bot.autoreact) {
    
    if (isChannel) {
    
    try {
        return await conn.newsletterReactMessage(
            m.key.remoteJid,
            m.newsletterServerId.low.toString(),
            randomEmoji
        );
    } catch (e) {
        console.error('فشل في إرسال التفاعل للقناة:', e);
    }
    
    } else if (isGroup && chat.autoreact) {
    
    try {
        return await conn.sendMessage(m.chat, { react: { text: randomEmoji2, key: m.key } });
    } catch (e) {
        console.error('فشل في إرسال التفاعل للمجموعه:', e);
    }
    
    } else if (isPrivate && chat.autoreact) {
    
    try {
        return await conn.sendMessage(m.chat, { react: { text: randomEmoji2, key: m.key } });
    } catch (e) {
        console.error('فشل في إرسال التفاعل للمستخدم:', e);
    }
    
    } else if (isStory) {
    
    const me = await conn.decodeJid(conn.user.id);
    
    try {
        await conn.readMessages([m.key]);
        
        await conn.sendMessage(m.key.remoteJid, { react: { text: emojj2, key: m.key } }, { statusJidList: [m.key.participant, me] });
        return;
    } catch (e) {
        console.error('فشل في إرسال التفاعل للحاله:', e);
    }
    
    }
    }
}