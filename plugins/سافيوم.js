import { WebSocket } from 'ws';
import zlib from 'zlib';

function generateWords(totalEnd = 10) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const chars = letters + digits;

  if (totalEnd < 5) throw new Error('الحد الأدنى للطول هو 5');
  if (totalEnd > chars.length) throw new Error(`الحد الأقصى للطول هو ${chars.length}`);

  let firstChar = letters[Math.floor(Math.random() * letters.length)];
  let secondChar;
  do {
    secondChar = letters[Math.floor(Math.random() * letters.length)];
  } while (secondChar === firstChar);

  const firstTwo = firstChar + secondChar;
  const totalLength = Math.floor(Math.random() * (totalEnd - 5 + 1)) + 5;
  const remainingLength = totalLength - 2;
  const used = new Set([firstChar, secondChar]);
  let wordRest = '';

  while (wordRest.length < remainingLength) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    if (used.has(char)) continue;
    used.add(char);
    wordRest += char;
  }

  return firstTwo + wordRest;
}

async function generateAccount(option) {
  if (!option || typeof option.isRunning !== 'boolean') {
    throw new Error('الخيار option غير مهيأ بشكل صحيح');
  }
  if (!option.isRunning) return;
  if (option.success >= option.total) return;

  const id = Math.random().toString(10).slice(2, 12);
  const workerId = Math.random().toString(36).slice(2, 26);
  const username = generateWords(15);
  option.activeWorkers.add(workerId);

  try {
    const ws = new WebSocket('wss://195.13.182.213/Auth', {
      rejectUnauthorized: false,
      headers: {
        app: 'com.safeum.android',
        remoteIp: '195.13.182.213',
        remotePort: '8080',
        sessionId: 'b6cbb22d-06ca-41ff-8fda-c0ddeb148195',
        time: new Date().toISOString(),
        url: 'wss://51.79.208.190/Auth'
      }
    });

    await new Promise((resolve) => {
      ws.on('open', () => {
        const data = {
          action: 'Register',
          subaction: 'Desktop',
          locale: 'ar_EG',
          gmt: '+03',
          password: {
            m1x: '8d589ae17267d3e33301c16497ed731d92ebdd1784830abaafa12cff66703017',
            m1y: '6fa74a69ad0d56c74978df6916ffc1a89cd973c296aa9465e7d587776ad44b43',
            m2: '30cfa6e82da7889cdfeec3a95730e2305d90716e7ff2345d931167a8e777e589',
            iv: '47f411b7ee73e26564a4c12e6c29283d',
            message: '7e17a0db4bb5b145ec772ba26e3f5ff581da505d38911c317eed67a3101136cc30cab7c7a2c177c59aec21682f1a3f9b840870417f0d1d5c1327f1f4aca940a6d5f299e4b57da1556eefb12b0a7ff9cb'
          },
          magicword: {
            m1x: 'db9fedd1d974b59fae2d8e677dba01a46248e6149668d79d06d83cb884c470a5',
            m1y: '097e0b4ef87ba0854c4712d494e722b07b84b9c7db0ba8bc2964ae37ca1a7850',
            m2: 'd3b0b86a805b1413224619392f20b38b92ff6f1d974c4b164e97fb8c5286c17f',
            iv: 'b3297c537192980eaae661e78c76c6a1',
            message: 'be2961cd8ba6a57dc7014e39dce26bd8'
          },
          magicwordhint: '0000',
          login: username,
          devicename: 'Stitch Service',
          softwareversion: '1.1.0.2300',
          nickname: 'sbxkdnbwkdhfkdn',
          os: 'AND',
          deviceuid: '4b81ce4e8c8208f4',
          devicepushuid: '*dea1cKAUQqSGUUh445-13X:APA91bG4_Bog5JK6OOGCtvpjmvYc_rznLzmKIYuUjkKJKlYbjsU4BCwL-ucmmzXyLXj-VB3sZ7w5DRBrt0AuAi7YVGKMnCLAf-u0Iy3z7_w3zW6uj5UFgUQ',
          osversion: 'and_12.0.0',
          id: '1428254296'
        };
        ws.send(JSON.stringify(data));
      });

      ws.on('message', (message) => {
        zlib.gunzip(message, (err, buffer) => {
          if (err) {
            option.retry++;
          } else {
            const text = buffer.toString();
            if (text.includes('"status":"Success"')) {
              option.success++;
              option.accounts.push({ id, username, password: 'jjjj' });
            } else {
              option.failed++;
            }
          }
          resolve();
          ws.close();
        });
      });

      ws.on('error', () => {
        option.retry++;
        resolve();
        ws.close();
      });
    });
  } catch {
    option.retry++;
  } finally {
    option.activeWorkers.delete(workerId);
    if (option.isRunning && option.success < option.total) {
      setImmediate(() => generateAccount(option));
    } else if (option.success >= option.total) {
      option.isRunning = false;
      const list = option.accounts.map((acc, i) =>
        `*[ ${i + 1} ]* : \n  ⊳ ID: ${acc.id}\n  ⊳ Username: ${acc.username}\n  ⊳ Password: ${acc.password}`
      ).join('\n\n');
      
      option.msg.reply(
      `انتهت العملية. \nتم إنشاء ${option.success} حسابًا بنجاح!\n\nقائمة الحسابات:\n\n${list}`
      );
    }
  }
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      `خدمة SafeUm لإنشاء الحسابات\n` +
      `الأوامر المتاحة:\n` +
      `• صنع <عدد>   بدء إنشاء حسابات\n` +
      `• ايقاف       إيقاف العملية الجارية\n` +
      `• الحاله      عرض التقدم والإحصائيات\n` +
      `• الحسابات    عرض قائمة الحسابات المنشأة`
    );
  }

  tmc.safeum = tmc.safeum || {};
  tmc.safeum[m.sender] = tmc.safeum[m.sender] || {
    isRunning: false,
    failed: 0,
    success: 0,
    retry: 0,
    accounts: [],
    activeWorkers: new Set(),
    total: 0,
    conn,
    chat: m.chat,
    msg: m
  };

  const [cmd, numRaw] = text.trim().split(/\s+/);
  const count = parseInt(numRaw, 10);
  const ctx = tmc.safeum[m.sender];

  switch (cmd.toLowerCase()) {
    case 'صنع':
    case 'create':
      if (ctx.isRunning) {
        return m.reply('⚠️ هناك عملية جارية بالفعل، استخدم "ايقاف" قبل البدء من جديد.');
      }
      if (isNaN(count) || count < 1) {
        return m.reply('❌ الرجاء تحديد عدد صحيح أكبر من صفر. مثال: "صنع 5"');
      }
      ctx.isRunning = true;
      ctx.failed = 0;
      ctx.success = 0;
      ctx.retry = 0;
      ctx.accounts = [];
      ctx.total = count;
      ctx.activeWorkers = new Set();
      ctx.conn = conn;
      ctx.chat = m.chat;
      ctx.msg = m;

      m.reply(
        `✅ بدأت عملية إنشاء ${count} حسابات.\n` +
        `• استخدم "الحاله" لمتابعة التقدم.\n` +
        `• استخدم "ايقاف" لإيقاف العملية.`
      );

      for (let i = 0; i < Math.min(3, count); i++) generateAccount(ctx);
      break;

    case 'ايقاف':
    case 'stop':
      if (!ctx.isRunning) return m.reply('ℹ️ لا توجد عملية جارية لإيقافها.');
      ctx.isRunning = false;
      ctx.activeWorkers.clear();
      m.reply('🛑 تم إيقاف العملية بنجاح.');
      if (ctx.accounts.length) {
      const accountList = ctx.accounts.map((acc, i) =>
        `🔹 حساب ${i + 1}:\n   • المستخدم: ${acc.username}\n   • كلمة السر: ${acc.password}\n   • المعرف: ${acc.id}`
      ).join('\n\n');
      m.reply(`📋 قائمة الحسابات المنشأة:\n\n${accountList}`);
      }
      break;

    case 'الحاله':
    case 'status':
      m.reply(
        `📊 حالة العملية:\n` +
        `• جاري التنفيذ: ${ctx.isRunning ? 'نعم' : 'لا'}\n` +
        `• إجمالي المطلوب: ${ctx.total}\n` +
        `• نجاح: ${ctx.success}\n` +
        `• فشل: ${ctx.failed}\n` +
        `• إعادة المحاولة: ${ctx.retry}\n` +
        `• عمال نشطون: ${ctx.activeWorkers.size}`
      );
      break;

    case 'الحسابات':
    case 'accounts':
      if (!ctx.accounts.length) return m.reply('📭 لا توجد حسابات منشأة بعد.');
      const accountList = ctx.accounts.map((acc, i) =>
        `🔹 حساب ${i + 1}:\n   • المستخدم: ${acc.username}\n   • كلمة السر: ${acc.password}\n   • المعرف: ${acc.id}`
      ).join('\n\n');
      m.reply(`📋 قائمة الحسابات المنشأة:\n\n${accountList}`);
      break;

    default:
      m.reply(
        `❓ الأمر غير معروف. الأوامر المتاحة:\n` +
        `• صنع <عدد>\n` +
        `• ايقاف\n` +
        `• الحاله\n` +
        `• الحسابات`
      );
  }
};

handler.help = ['safeum create', 'safeum stop', 'safeum status', 'safeum accounts'];
handler.tags = ['tools'];
handler.command = ['سافيوم', 'safeum'];
handler.owner = true;

export default handler;