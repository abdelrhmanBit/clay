let handler = m => m  

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {  
    if (!m.isGroup) return !1  

    let chat = global.db.data.chats[m.chat] || {}  
    if (isBotAdmin && chat.autoRechazar) {  
        const prefixes = ['249', '212']  

        if (m.sender && prefixes.some(prefix => m.sender.startsWith(prefix))) {  
            await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')  
        }  
    }  
}  

export default handler