import { spawn } from 'child_process'

let handler = async (m, { conn, isROwner, text }) => {
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js'
    if (global.conn.user.jid == conn.user.jid) {
        await m.reply('🔄 يتم إعادة تشغيل البوت الآن... يرجى الانتظار')
        process.exit(0)
    } else throw 'eh'
}

handler.help = ['restart']
handler.tags = ['host']
handler.command = ['restart', 'ريستارت', 'اعادة-تشغيل']

handler.rowner = true

export default handler
