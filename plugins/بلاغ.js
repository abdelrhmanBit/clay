const handler = async (m, { conn, text }) => {
  const [nomor, reason] = text.split('|');
  if (!nomor)
    throw `*[ ⚠️ ] يجب أن تضع الرقم*\n*الاستخدام الصحيح:*\n*—◉ .بلاغ الرقم|السبب*`;
  if (!reason)
    throw `*[ ⚠️ ] يجب أن تضع سبب البلاغ*\n*الاستخدام الصحيح:*\n*—◉ .بلاغ الرقم|السبب*`;

  // تنسيق الرقم ليصبح صالحًا للاستخدام مع واتساب
  const fixedNumber =
    nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') +
    '@s.whatsapp.net';

  // فك الحظر عن الرقم (إذا كان محظورًا) للسماح بإجراء البلاغات مرة أخرى
  await conn.updateBlockStatus(fixedNumber, 'unblock');

  // تنفيذ 40 بلاغًا فعليًا
  for (let i = 1; i <= 40; i++) {
    await conn.report(fixedNumber, 'spam', reason); // تقديم بلاغ فعلي لواتساب
    console.log(`تم تقديم البلاغ رقم ${i} ضد الرقم ${fixedNumber}`);
    
    // تأخير بين البلاغات لتجنب الحظر (اختياري)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // بعد تنفيذ 40 بلاغًا، يتم حظر الرقم
  await conn.updateBlockStatus(fixedNumber, 'block');

  await m.reply(
    `*[❗] تم تقديم 40 بلاغًا للرقم ${nomor}*\n*السبب: ${reason}*\n*والرقم تم حظره بعد البلاغ رقم 40*`
  );
};

handler.help = ['بلاغ <رقم>|<سبب>'];
handler.tags = ['General'];
handler.command = /^بلاغ$/i;
handler.premium = true;
handler.rowner = true;
export default handler;