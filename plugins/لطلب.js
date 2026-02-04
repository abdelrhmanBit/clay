import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

let handler = async (m, { command, text, conn }) => {
  const curl = m.quoted?.text || '';
  const [lang, ...curlParts] = (text || '').trim().split(' ');
  const curlCode = curlParts.join(' ');

  if (!lang) {
    if (!curl.trim().startsWith('curl')) return m.reply('قم بالرد على كود curl أولاً.');

    const supportedLanguages = [
      { id: 'js', title: 'JavaScript', description: 'باستخدام XMLHttpRequest' },
      { id: 'node', title: 'Node Fetch', description: 'باستخدام fetch في Node.js' },
      { id: 'axios', title: 'Node Axios', description: 'باستخدام مكتبة Axios' },
      { id: 'py', title: 'Python Requests', description: 'باستخدام requests' },
      { id: 'httpclient', title: 'Python HttpClient', description: 'باستخدام http.client' },
      { id: 'php', title: 'PHP cURL', description: 'باستخدام curl' },
      { id: 'go', title: 'Go', description: 'باستخدام net/http' },
      { id: 'dart', title: 'Dart HTTP', description: 'باستخدام مكتبة http' },
      { id: 'java', title: 'Java OkHttp', description: 'باستخدام OkHttp' },
      { id: 'csharp', title: 'C# HttpClient', description: 'باستخدام HttpClient' },
      { id: 'ansible', title: 'Ansible URI', description: 'باستخدام الوحدة URI' },
      { id: 'r', title: 'R httr', description: 'باستخدام مكتبة httr' },
      { id: 'rust', title: 'Rust Reqwest', description: 'باستخدام Reqwest' },
      { id: 'strest', title: 'Strest', description: 'صيغة Strest' },
    ];

    const interactiveMessage = {
      body: { text: '*—◉ اختر اللغة التي تريد تحويل كود curl إليها:*' },
      footer: { text: `${global.wm || 'curl to code bot'}` },
      header: {
        title: '*< تحويل كود curl >*',
        hasMediaAttachment: false,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'اللغات المدعومة',
              sections: [
                {
                  title: 'اختر لغة التحويل',
                  rows: supportedLanguages.map(lang => ({
                    header: lang.title,
                    title: lang.id,
                    description: lang.description,
                    id: `.لطلب ${lang.id} ${curl}`
                  }))
                }
              ]
            })
          }
        ],
        messageParamsJson: ''
      }
    };

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: { interactiveMessage }
      }
    }, { userJid: conn.user.jid, quoted: m });

    return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  if (!curlCode.trim().startsWith('curl')) {
    return m.reply('يرجى كتابة كود curl بعد اللغة، أو الرد على كود curl مباشرة.');
  }

  const convert = await import('curlconverter');
  let code;

  try {
    switch (lang) {
      case 'js': code = convert.toJavaScript(curlCode); break;
      case 'node': code = convert.toNodeFetch(curlCode); break;
      case 'axios': code = convert.toNodeAxios(curlCode); break;
      case 'py': code = convert.toPython(curlCode); break;
      case 'httpclient': code = convert.toPythonHttpClient(curlCode); break;
      case 'php': code = convert.toPhp(curlCode); break;
      case 'go': code = convert.toGo(curlCode); break;
      case 'dart': code = convert.toDart(curlCode); break;
      case 'java': code = convert.toJava(curlCode); break;
      case 'csharp': code = convert.toCSharp(curlCode); break;
      case 'ansible': code = convert.toAnsible(curlCode); break;
      case 'r': code = convert.toR(curlCode); break;
      case 'rust': code = convert.toRust(curlCode); break;
      case 'strest': code = convert.toStrest(curlCode); break;
      default: return m.reply('❌ لغة غير مدعومة.');
    }
  } catch (err) {
    return m.reply(`❌ حدث خطأ أثناء التحويل:\n${err.message || err}`);
  }

  return conn.sendButton(m.chat, `Convert Curl to ${lang}`, wm, null, [['', '']], [['نسخ', code]], null, m);
  //m.reply(`\`\`\`${lang}\n${code}\n\`\`\``);
};

handler.command = ['لطلب'];
export default handler;