import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

const handler = async (m, { conn }) => {
    await m.reply('⏳ جاري قياس سرعة الإنترنت...');

    let o;
    try {
        // Try using speedtest-cli if installed
        o = await exec('speedtest-cli --simple --share', { timeout: 60000 });
        const { stdout, stderr } = o;

        if (stdout.trim()) {
            await m.reply(`*📊 نتائج اختبار السرعة:*\n\n${stdout.trim()}`);
        } else if (stderr.trim()) {
            await m.reply(`*⚠️ تحذير:*\n${stderr.trim()}`);
        }
    } catch (e) {
        // Fallback: try speedtest (ookla official)
        try {
            o = await exec('speedtest --accept-license --accept-gdpr', { timeout: 60000 });
            const { stdout } = o;

            if (stdout.trim()) {
                await m.reply(`*📊 نتائج اختبار السرعة:*\n\n\`\`\`\n${stdout.trim()}\n\`\`\``);
            }
        } catch (e2) {
            // Final fallback: inform user
            const errorMsg = `*❌ فشل اختبار السرعة*\n\n` +
                `يبدو أن أداة speedtest غير مثبتة على الخادم.\n\n` +
                `*الحلول المقترحة:*\n` +
                `1. تثبيت speedtest-cli: \`pip install speedtest-cli\`\n` +
                `2. تثبيت Ookla Speedtest: \`https://www.speedtest.net/apps/cli\`\n\n` +
                `*رسالة الخطأ:*\n\`\`\`\n${e2.message}\n\`\`\``;

            await m.reply(errorMsg);
        }
    }
};

handler.help = ['speedtest', 'السرعه'];
handler.tags = ['info', 'tools'];
handler.command = /^(السرعه|speed|speedtest)$/i;

export default handler;