import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import tmp from 'tmp';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const handler = async (m, { conn, args }) => {
  
  const filters = [
      { name: 'Gray Scale', filter: 'hue=s=0' },
      { name: 'Inverted', filter: 'lutrgb=r=255-val:g=255-val:b=255-val' },
      { name: 'Sharpen', filter: 'unsharp=5:5:1.0:5:5:0.0' },
      { name: 'Sepia', filter: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131' },
      { name: 'Vintage', filter: 'curves=vintage' },
      { name: 'Bright', filter: 'eq=brightness=0.06' },
      { name: 'Contrast Boost', filter: 'eq=contrast=1.5' },
      { name: 'Saturation Boost', filter: 'eq=saturation=2.0' },
      { name: 'Blur', filter: 'boxblur=5:1' },
      { name: 'Edge Detect', filter: 'edgedetect=low=0.1:high=0.4' },
      { name: 'Cartoon', filter: 'toon=5:2' },
      { name: 'Emboss', filter: 'convolution="-2 -1 0 -1 1 1 0 1 2"' },
      { name: 'Red Tint', filter: 'colorbalance=rs=.5' },
      { name: 'Blue Tint', filter: 'colorbalance=bs=.5' },
      { name: 'Green Tint', filter: 'colorbalance=gs=.5' },
      { name: 'Glitch', filter: 'tblend=all_mode=grainextract:all_opacity=0.7' },
      { name: 'Vignette', filter: 'vignette' },
      { name: 'Glow', filter: 'boxblur=2:1,eq=brightness=0.1' },
      { name: 'HDR Effect', filter: 'eq=contrast=1.3:saturation=1.3' },
      { name: 'B&W Film', filter: 'hue=s=0,curves=strong_contrast' },
      { name: 'Sketch', filter: 'edgedetect,negate' },
      { name: 'Deep Shadows', filter: 'curves=preset=strong_contrast' },
      { name: 'Dreamy', filter: 'boxblur=3:1,eq=brightness=0.05:saturation=1.4' },
      { name: 'Cinematic', filter: 'colorchannelmixer=1.5:0:0:0:0:1.2:0:0:0:0:1.0' },
      { name: 'Cool Tone', filter: 'colorbalance=bs=0.3' },
      { name: 'Warm Tone', filter: 'colorbalance=rs=0.3' },
      { name: 'Fade', filter: "curves=r='0/0 1/0.9':g='0/0 1/0.9':b='0/0 1/0.9'" },
    ];
  
  
  conn.studio = conn.studio || {};
  const id = m.sender;

  const isDone = args[0] === 'done';
  const isClear = args[0] === 'clear';

  if (isClear) {
    delete conn.studio[id];
    return m.reply('🧹 تم مسح الصور المؤقتة.');
  }

  if (isDone) {
    const items = conn.studio[id];
    if (!items || items.length < 1) return m.reply('❌ لا توجد صور محفوظة. أرسل صورة مع رقم الفلتر أولًا.');

    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    const dirPath = tmpDir.name;

    const processedPaths = [];

    for (let i = 0; i < items.length; i++) {
      const { imageBuffer, filter } = items[i];
      const input = path.join(dirPath, `img${i}.jpg`);
      const output = path.join(dirPath, `out${i}.jpg`);
      fs.writeFileSync(input, imageBuffer);

      await new Promise((resolve, reject) => {
        ffmpeg(input)
          .videoFilter(filter)
          .frames(1)
          .save(output)
          .on('end', () => {
            processedPaths.push(output);
            resolve();
          })
          .on('error', reject);
      });
    }

    // دمج الصور أفقيًا باستخدام sharp
    const mergedPath = path.join(dirPath, 'merged.jpg');
    const images = await Promise.all(processedPaths.map(p => sharp(p).resize(400).toBuffer()));
    const { data, info } = await sharp({
      create: {
        width: 400 * images.length,
        height: 400,
        channels: 3,
        background: '#fff',
      },
    })
      .composite(images.map((input, i) => ({ input, top: 0, left: i * 400 })))
      .jpeg()
      .toBuffer({ resolveWithObject: true });

    fs.writeFileSync(mergedPath, data);

    // إنشاء فيديو من الصور واحدة تلو الأخرى
    const videoPath = path.join(dirPath, 'gallery.mp4');
    await new Promise((resolve, reject) => {
      const command = ffmpeg();

      processedPaths.forEach(p => {
        command.input(p).loop(2); // عرض كل صورة 2 ثانية
      });

      command
        .on('end', resolve)
        .on('error', reject)
        .outputOptions([
          '-r', '25',
          '-t', `${processedPaths.length * 2}`,
          '-pix_fmt', 'yuv420p',
          '-s', '640x400',
        ])
        .save(videoPath);
    });

    // إرسال الفيديو والصورة
    await conn.sendFile(m.chat, videoPath, 'gallery.mp4', '🎞️ فيديو تجميعي للصور', m);
    await conn.sendFile(m.chat, mergedPath, 'merged.jpg', '🖼️ صورة مدمجة', m);

    tmpDir.removeCallback();
    delete conn.studio[id];
    return;
  }
  
    const quoted = m.quoted || m;
    const mime = (quoted.msg || quoted).mimetype || '';
    if (!/image/.test(mime)) return m.reply('Please reply to an image.');
    
    const media = await quoted.download();
    
    if (!args[0] || isNaN(args[0]) || args[0] < 1 || args[0] > filters.length) {
      const list = filters.map((f, i) => `*${i + 1}.* ${f.name}`).join('\n');
      return m.reply(`Choose a filter number:\n\n${list}\n\nExample: *.filter 2*`);
    }
    
    const selectedFilter = filters[Number(args[0]) - 1];
    
    if (!conn.studio[id]) conn.studio[id] = [];
  conn.studio[id].push({ imageBuffer: media, filter: selectedFilter.filter });

  return m.reply(`The image with the filter has been saved: *${selectedFilter.name}*\n Send more, or send: *filter done*`);


};

handler.command = ['filter', 'فلتر'];
export default handler;