let handler = async (m, { conn, participants, usedPrefix, command }) => {

    let developers = ['201273070745@s.whatsapp.net', '201225784766@s.whatsapp.net'];   

    let kickte = `*مــنشـن الـشـخص !*`;

    if (!m.mentionedJid[0] && !m.quoted) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    if (developers.includes(user)) {
        // إذا حاول شخص طرد المطور، يتم طرده فورًا
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        return m.reply(`* برا*`);
    }

    // تنفيذ الطرد إذا لم يكن الشخص المطروح هو المطور
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    m.reply(`*تـــم الــطرد ✅*`);

    let admins = participants.filter(participant => participant.admin).map(participant => participant.id);
    let alertMessage = `*⚠️┃ تم طرد ${user} من المجموعة*`;

    conn.sendMessage(m.chat, { text: alertMessage, mentions: admins });
}

handler.help = ['kick @user'];
handler.tags = ['group'];
handler.command = ['kick', 'طرد'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;