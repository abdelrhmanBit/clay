import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  let createCanvas, loadImage;

  try {
    const canvasModule = await import('canvas');
    createCanvas = canvasModule.createCanvas;
    loadImage = canvasModule.loadImage;
  } catch (e) {
    return m.reply('❌ عذراً، ميزة البروفايل غير مفعلة حالياً لأن مكتبة الرسم (Canvas) غير مثبتة.');
  }

  const who = m.mentionedJid?.[0] || m.sender;
  const name = await conn.getName(who);
  const number = who.split('@')[0];

  let statusText = 'لا توجد حالة';
  let profilePicUrl = 'https://telegra.ph/file/c0f8bb917592f4684820b.jpg';
  let coverUrl = 'https://telegra.ph/file/c0f8bb917592f4684820b.jpg';

  try {
    const status = await conn.fetchStatus(who);
    statusText = status[0]?.status?.status || statusText;
  } catch { }

  try {
    profilePicUrl = await conn.profilePictureUrl(who, 'image');
  } catch { }
  try {
    coverUrl = await conn.profilePictureUrl(conn.user.jid, 'image');
  } catch { }

  const width = 800;
  const height = 1500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // خلفية داكنة بتدرج
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1e1e2f');
  gradient.addColorStop(1, '#111117');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // تحميل الصور
  const [coverImg, profileImg] = await Promise.all([
    loadImage(coverUrl),
    loadImage(profilePicUrl)
  ]);

  // رسم الغلاف
  const coverHeight = 180;
  ctx.drawImage(coverImg, 0, 0, width, coverHeight);

  // الصورة الشخصية بدائرة وسط الغلاف
  const avatarSize = 100;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = coverHeight - avatarSize / 2;

  // إطار متوهج حول الصورة
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#25d366';
  ctx.fill();
  ctx.closePath();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(profileImg, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // الاسم
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(name, width / 2, avatarY + avatarSize + 45);

  // الرقم
  ctx.font = '24px Arial';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(number, width / 2, avatarY + avatarSize + 85);

  // صندوق الحالة
  const boxY = avatarY + avatarSize + 110;
  const boxHeight = 100;
  const boxRadius = 30;

  // خلفية الحالة مع الحواف الدائرية
  ctx.fillStyle = 'rgba(40, 40, 50, 0.9)';
  roundRectFunc(ctx, 50, boxY, width - 10, boxHeight, boxRadius);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  wrapTextFunc(ctx, statusText, width / 2, boxY + 60, width - 140, 34);

  // إرسال الصورة
  const buffer = canvas.toBuffer();
  await conn.sendFile(m.chat, buffer, 'profile.png', '', m);
};

// دالة رسم مستطيل بحواف دائرية
function roundRectFunc(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// دالة التفاف نص الحالة
function wrapTextFunc(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

handler.help = ['profile'];
handler.tags = ['user'];
handler.command = ['profile', 'بروفايل'];

export default handler;