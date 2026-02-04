import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Global state to track test progress and errors
global.testStore = global.testStore || {
    isRunning: false,
    successful: [],
    errors: [],
    skipped: [],
    totalProcessed: 0,
    startTime: null,
    stopRequested: false
};

let handler = async (m, { conn, text, usedPrefix, isROwner, command }) => {
    const store = global.testStore;

    // Shell command execution mode
    if ((command === 'exec' || command === 'تنفيذ') && text) {
        m.reply('⏳ جاري تنفيذ الأمر...');
        try {
            const { stdout, stderr } = await execPromise(text, {
                timeout: 60000,
                maxBuffer: 10 * 1024 * 1024
            });
            let output = '';
            if (stdout) output += `*📤 الإخراج (stdout):*\n\`\`\`\n${stdout}\n\`\`\`\n\n`;
            if (stderr) output += `*⚠️ الأخطاء (stderr):*\n\`\`\`\n${stderr}\n\`\`\`\n\n`;
            if (!stdout && !stderr) output = '✅ تم التنفيذ بنجاح بدون إخراج.';
            if (output.length > 4000) {
                const chunks = output.match(/[\s\S]{1,4000}/g) || [];
                for (const chunk of chunks) await m.reply(chunk);
            } else {
                await m.reply(output);
            }
        } catch (error) {
            let errorMsg = `*❌ فشل التنفيذ:*\n\n*الأمر:* \`${text}\`\n\n`;
            if (error.stdout) errorMsg += `*📤 الإخراج:*\n\`\`\`\n${error.stdout}\n\`\`\`\n\n`;
            if (error.stderr) errorMsg += `*⚠️ الأخطاء:*\n\`\`\`\n${error.stderr}\n\`\`\`\n\n`;
            errorMsg += `*💥 رسالة الخطأ:*\n\`\`\`\n${error.message}\n\`\`\``;
            await m.reply(errorMsg);
        }
        return;
    }

    // Status / Errors command
    if (command === 'errors' || command === 'اخطاء') {
        if (!store.startTime && store.totalProcessed === 0) {
            return m.reply('❌ لم يتم إجراء أي اختبارات بعد. استخدم الأمر `.eyeq` للبدء.');
        }

        let report = `*📊 حالة الاختبار:*\n`;
        report += `• الحالة: ${store.isRunning ? '🔄 قيد التشغيل' : '✅ مكتمل'}\n`;
        report += `• الأوامر الناجحة: ${store.successful.length}\n`;
        report += `• الأخطاء المكتشفة: ${store.errors.length}\n`;
        report += `• الأوامر التي تم تخطيها: ${store.skipped.length}\n`;
        report += `• الإجمالي المعالج: ${store.totalProcessed}\n`;
        if (store.startTime) report += `• بدأ في: ${new Date(store.startTime).toLocaleTimeString()}\n`;

        await m.reply(report);

        if (store.errors.length > 0) {
            let errorReport = `*❌ تفاصيل الأخطاء (${store.errors.length}):*\n\n`;
            for (let i = 0; i < store.errors.length; i++) {
                const err = store.errors[i];
                errorReport += `*${i + 1}. الأمر:* \`${usedPrefix}${err.command}\`\n`;
                errorReport += `*الخطأ:* ${err.error}\n`;
                errorReport += `------------------------------------------------------\n\n`;
                if (errorReport.length > 3500 || i === store.errors.length - 1) {
                    await m.reply(errorReport);
                    errorReport = '';
                }
            }
        }
        return;
    }

    // Stop command
    if (text === 'stop' || text === 'ايقاف') {
        if (!store.isRunning) return m.reply('❌ لا يوجد اختبار قيد التشغيل حالياً.');
        store.stopRequested = true;
        return m.reply('⏳ سيتم إيقاف الاختبار بعد انتهاء الأمر الحالي...');
    }

    // Test all commands mode
    if (command === 'eyeq' || command === 'اختبار-الكل') {
        if (store.isRunning) return m.reply('⚠️ هناك اختبار قيد التشغيل بالفعل. استخدم `.eyeq stop` لإيقافه.');

        // Reset store
        store.isRunning = true;
        store.successful = [];
        store.errors = [];
        store.skipped = [];
        store.totalProcessed = 0;
        store.startTime = Date.now();
        store.stopRequested = false;

        await m.reply('🧪 *بدء اختبار جميع الأوامر...*\n\n• توقف عند أول خطأ: ✅\n• عرض الأخطاء: استخدم `.errors`');

        const dangerousCommands = [
            'exec', 'تنفيذ', 'testall', 'eyeq', 'اختبار-الكل',
            'restart', 'ريستارت', 'reboot', 'بوم', 'يلا', 'اضرب',
            'طرد-الكل', 'طرد-مشرفين', 'طرد-15', 'سونغ', 'زرف',
            'errors', 'اخطاء'
        ];

        let testInterrupted = false;

        for (const [pluginName, plugin] of Object.entries(global.plugins)) {
            if (store.stopRequested) {
                testInterrupted = true;
                break;
            }

            if (!plugin || plugin.disabled || typeof plugin !== 'function') continue;

            const commands = plugin.command;
            if (!commands) continue;

            let cmdList = [];
            if (Array.isArray(commands)) cmdList = commands.filter(c => typeof c === 'string');
            else if (typeof commands === 'string') cmdList = [commands];
            else if (commands instanceof RegExp) {
                const match = commands.toString().match(/\^?\(([^)]+)\)/);
                if (match) cmdList = match[1].split('|').map(c => c.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, ''));
            }

            for (const cmd of cmdList) {
                if (store.stopRequested) {
                    testInterrupted = true;
                    break;
                }
                if (!cmd || cmd.length < 2) continue;

                store.totalProcessed++;
                if (dangerousCommands.includes(cmd.toLowerCase())) {
                    store.skipped.push(cmd);
                    continue;
                }

                try {
                    const fakeM = { ...m, text: `${usedPrefix}${cmd}`, command: cmd, args: [], isCommand: true };
                    await plugin.call(conn, fakeM, {
                        conn, usedPrefix, command: cmd, text: '', args: [],
                        isROwner: true, isOwner: true, isAdmin: true, isBotAdmin: true, isGroup: m.isGroup || false
                    });
                    store.successful.push(cmd);
                } catch (error) {
                    store.errors.push({ command: cmd, plugin: pluginName, error: error.message || error.toString() });

                    // Stop at first error as requested
                    store.isRunning = false;
                    await m.reply(`*❌ توقف الاختبار بسبب خطأ في الأمر:* \`${usedPrefix}${cmd}\`\n\n*الخطأ:* ${error.message || error.toString()}\n\n*استخدم \`.errors\` لعرض الملخص.*`);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            if (testInterrupted) break;
        }

        store.isRunning = false;
        if (testInterrupted) {
            await m.reply('🛑 تم إيقاف الاختبار بناءً على طلبك.');
        } else {
            await m.reply('✅ اكتمل اختبار جميع الأوامر بنجاح دون أخطاء توقف!');
        }
    }
};

handler.help = ['exec', 'eyeq', 'errors'];
handler.tags = ['owner'];
handler.command = /^(exec|تنفيذ|eyeq|اختبار-الكل|errors|اخطاء)$/i;
handler.rowner = true;

export default handler;
