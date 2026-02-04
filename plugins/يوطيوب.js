import axios from 'axios';

const handler = async (m, { text, conn }) => {
  if (!text) {
    return m.reply('❌ يرجى إرسال رابط الفيديو.');
  }

  try {
    const response = await axios.post(
      'https://www.videototext.io/api/download/info',
      {
        url: text,
        source: 'YouTube'
      },
      {
        headers: {
          'Host': 'www.videototext.io',
          'Connection': 'keep-alive',
          'Content-Length': '68',
          'sec-ch-ua-platform': '"Android"',
          'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Android WebView";v="134"',
          'sec-ch-ua-mobile': '?1',
          'baggage': 'sentry-environment=production,sentry-release=04ace0a58b52e24c9f6fc1f75b9334f91ddc7d68,sentry-public_key=24a82af4a95a4957aa55aea5d553f2dc,sentry-trace_id=768e5e8eef994d4daf99877702ca714a,sentry-sample_rate=1,sentry-sampled=true',
          'sentry-trace': '768e5e8eef994d4daf99877702ca714a-818b7d50ace04622-1',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 9; CPH1923 Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.95 Mobile Safari/537.36',
          'accept': 'application/json',
          'content-type': 'application/json',
          'Origin': 'https://www.videototext.io',
          'X-Requested-With': 'mark.via.gp',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          'Referer': 'https://www.videototext.io/ar/youtube-downloader',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cookie': 'NEXT_LOCALE=ar; __Host-authjs.csrf-token=d0112d92203a4ef3a1baa047de8b44fa5be875490b505199131a993f0786060c%7C5077cede37980c9108fcc06f3b99f37577d5c81d46a59bbbfa3a5c40bfbca349; __Secure-authjs.callback-url=https%3A%2F%2Fwww.videototext.io; dom3ic8zudi28v8lr6fgphwffqoz0j6c=aa109a0f-a2b6-4fd0-aa4a-d7e5070729aa%3A1%3A1; imprCounter_a73eec18c5aa689638e8da4d42c874f8_expiry=Tue, 18 Mar 2025 14:22:34 GMT; __stripe_mid=4fd63861-b1aa-4d8a-99c0-38d612f87cec2bb014; __stripe_sid=235f919d-946a-4c29-8303-6a26aaa8e632d1ba36; imprCounter_a73eec18c5aa689638e8da4d42c874f8=2'
        }
      }
    );

    const data = response.data;
    if (data.code !== 0) {
      return m.reply('❌ فشل في جلب البيانات.');
    }

    const videoTitle = data.data.title;
    const formats = data.data.formats;
    const bestFormat = formats.find(f => f.format_note.includes('audio')) || formats[0];

    const downloadLink = bestFormat.url;
    await conn.sendMessage(m.chat, { text: `🎥 *العنوان:* ${videoTitle}\n🔗 *رابط التحميل:* ${downloadLink}` });

  } catch (error) {
    console.error(error);
    m.reply('❌ حدث خطأ أثناء جلب الفيديو.');
  }
};

handler.command = /^يوطيوب$/i;
export default handler;