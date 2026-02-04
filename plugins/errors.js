import fs from 'fs';

let handler = async (m) => {
    let logPath = './error_log.txt';
    if (!fs.existsSync(logPath)) return m.reply('No error logs found.');

    let logs = fs.readFileSync(logPath, 'utf-8');
    if (logs.length > 4000) logs = logs.slice(-4000);

    await m.reply(`*Current Session Error Logs:*\n\n${logs}`);
};

handler.help = ['errors'];
handler.tags = ['owner'];
handler.command = ['errors', 'الاخطاء'];
handler.owner = true;

export default handler;
