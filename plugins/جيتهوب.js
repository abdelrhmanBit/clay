import fetch from 'node-fetch';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const handler = async (m, {args, usedPrefix, command}) => {
  
  if (!args[0]) return m.reply(`يرجى تقديم رابط GitHub صحيح باستخدام الصيغة التالية: *${usedPrefix + command}* https://github.com/BrunoSobrino/TheMystic-Bot-MD`);
  if (!regex.test(args[0])) return m.reply(`رابط GitHub غير صحيح. يرجى التحقق من الرابط وإعادة المحاولة.`);
  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
  const filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
  m.reply('جاري تحميل الملف من GitHub...');
  conn.sendFile(m.chat, url, filename, null, m);
};
handler.command = /^(gitclone|repo|جيتي)$/i;
export default handler;