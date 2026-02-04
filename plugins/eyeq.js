import fs from 'fs';
import os from 'os';
import { format } from 'util';

let handler = async (m, { conn, usedPrefix }) => {
    await m.reply('*[ 🧪 ] بدء المحاكاة الحية لجميع الأوامر المتاحة... سيتم تجربة كل أمر فعلياً.*');

    let results = {
        success: [],
        failed: [],
        skipped: []
    };

    const plugins = Object.entries(global.plugins);
    const total = plugins.length;

    for (let i = 0; i < total; i++) {
        let [name, plugin] = plugins[i];

        // Determine the command name to test
        let cmdToTest = '';
        if (plugin.command) {
            if (Array.isArray(plugin.command)) cmdToTest = plugin.command[0];
            else if (typeof plugin.command === 'string') cmdToTest = plugin.command;
            else if (plugin.command instanceof RegExp) cmdToTest = 'test'; // Fallback for regex
        } else {
            cmdToTest = name.replace('.js', ''); // Use filename as fallback
        }

        // Skip protected/dangerous commands
        if (name.includes('eyeq') || name.includes('رستر') || name.includes('restart') || name.includes('exec') || name.includes('eval') || name.includes('settgid')) {
            results.skipped.push({ name: cmdToTest, reason: 'Protected' });
            continue;
        }

        // Simulate Message Object with valid-looking JID
        let testM = {
            ...m,
            chat: '123456789@s.whatsapp.net',
            sender: '123456789@s.whatsapp.net',
            text: `${usedPrefix}${cmdToTest}`,
            isDryRun: true,
            reply: async (text, ...args) => {
                // Keep it functional but silent unless needed
                return console.log(`[Diagnostic Reply: ${cmdToTest}]`, text);
            }
        };

        try {
            let extra = {
                conn: conn,
                usedPrefix,
                noPrefix: cmdToTest,
                args: [],
                command: cmdToTest,
                text: '',
                participants: [],
                groupMetadata: {},
                user: {},
                bot: {},
                isROwner: true,
                isOwner: true,
                isAdmin: true,
                isBotAdmin: true,
                isPrems: true,
                chatUpdate: {},
                __dirname: './plugins',
                __filename: name
            };

            // Call the plugin handler
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), 3000));
            await Promise.race([plugin.call(conn, testM, extra), timeout]);

            results.success.push(cmdToTest);
            // Small delay so messages don't overlap too much
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            results.failed.push({ name: cmdToTest, error: e.message || e });
            fs.appendFileSync('./error_log.txt', `[EYEQ SIM FAIL] ${cmdToTest}: ${format(e)}\n`);
        }
    }

    let report = `*╭──── [ 📉 تقرير المحاكاة الشامل ] ────╮*\n\n`;
    report += `*✅ نجح تنفيذ:* ${results.success.length}\n`;
    report += `*❌ فشل تنفيذ:* ${results.failed.length}\n`;
    report += `*⚠️ تخطي الأوامر الحساسة:* ${results.skipped.length}\n\n`;

    if (results.failed.length > 0) {
        report += `*🚫 قائمة الأوامر التي أطلقت أخطاء:*\n`;
        results.failed.slice(0, 20).forEach((f, index) => {
            report += `${index + 1}. ${usedPrefix}${f.name} ➜ _${f.error}_\n`;
        });
    }

    report += `\n*حالة الذاكرة:* ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\n`;
    report += `*╰────────────────────────╯*`;

    await m.reply(report);
};

handler.help = ['eyeq'];
handler.tags = ['owner'];
handler.command = ['eyeq'];
handler.owner = true;

export default handler;
