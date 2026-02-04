import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, usedPrefix, command, text }) => {
    await conn.sendMessage(m.chat, { react: { text: '📋', key: m.key } });

    const imagurl = 'https://files.catbox.moe/pi2y2v.jpg';

    // Map commands to tags
    const tagMap = {
        'ق': 'all',      // All commands
        'ق1': 'owner',   // Owner/Developer
        'ق2': 'tools',   // Conversion tools
        'ق3': 'downloader', // Download
        'ق4': 'group',   // Groups
        'ق5': 'fun',     // Entertainment/Games
        'ق6': 'tools',   // Tools (duplicate with ق2, but keeping for compatibility)
        'ق8': 'settings' // Settings (if any)
    };

    const tagTitles = {
        'all': '⌈ كــل الأقســام ⌋',
        'owner': '⌈ قســم المطــور ⌋',
        'tools': '⌈ قســم الأدوات والتحويل ⌋',
        'downloader': '⌈ قســم التحــميل ⌋',
        'group': '⌈ قســم المجمــوعات ⌋',
        'fun': '⌈ قســم الترفيــه ⌋',
        'settings': '⌈ قســم الإعــدادات ⌋'
    };

    const selectedTag = tagMap[command] || 'all';
    const title = tagTitles[selectedTag] || '⌈ القائمــة ⌋';

    // Collect commands
    let commandList = [];

    for (let plugin of Object.values(global.plugins)) {
        if (!plugin || plugin.disabled) continue;
        if (typeof plugin !== 'function') continue;

        const tags = plugin.tags || [];
        const commands = plugin.command;

        // Check if plugin matches selected tag
        if (selectedTag !== 'all' && !tags.includes(selectedTag)) {
            // Special handling for tools/conversion overlap
            if (selectedTag === 'tools' && !tags.includes('tools')) continue;
            if (selectedTag !== 'tools') continue;
        }

        if (!commands) continue;

        // Extract command names
        let cmdNames = [];
        if (Array.isArray(commands)) {
            cmdNames = commands.filter(c => typeof c === 'string');
        } else if (typeof commands === 'string') {
            cmdNames = [commands];
        } else if (commands instanceof RegExp) {
            // Skip regex commands for display
            continue;
        }

        if (cmdNames.length > 0) {
            const tagName = tags[0] || 'other';
            commandList.push({
                tag: tagName,
                commands: cmdNames.map(c => usedPrefix + c)
            });
        }
    }

    // Group by tag
    const grouped = {};
    for (const item of commandList) {
        if (!grouped[item.tag]) grouped[item.tag] = [];
        grouped[item.tag].push(...item.commands);
    }

    // Build message
    let message = `*${title}*\n\n`;

    if (Object.keys(grouped).length === 0) {
        message += '⚠️ لا توجد أوامر في هذا القسم.\n';
    } else {
        for (const [tag, cmds] of Object.entries(grouped)) {
            const uniqueCmds = [...new Set(cmds)];
            message += `*◈ ${tag.toUpperCase()} ◈*\n`;
            message += uniqueCmds.slice(0, 20).join(' • ') + '\n\n';
        }
    }

    message += `\n*◈ استخدم (${usedPrefix}) قبل كل أمر*\n`;
    message += `*◈ للعودة للقائمة الرئيسية: ${usedPrefix}اوامر*`;

    const mediaMessage = await prepareWAMessageMedia(
        { image: { url: imagurl } },
        { upload: conn.waUploadToServer }
    );

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: message },
                    footer: { text: wm || 'Bot Menu' },
                    header: {
                        hasMediaAttachment: true,
                        imageMessage: mediaMessage.imageMessage
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '🔙 القائمة الرئيسية',
                                    id: `${usedPrefix}اوامر`
                                })
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(ق|ق1|ق2|ق3|ق4|ق5|ق6|ق8)$/i;

export default handler;
