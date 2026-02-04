import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteUrl = 'https://pastebin.com';

const mimeTypes = {
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.html': 'text/html',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.py': 'text/x-python',
  '.java': 'text/x-java-source',
  '.cpp': 'text/x-c++src',
  '.c': 'text/x-csrc',
  '.php': 'application/x-httpd-php',
  '.sh': 'application/x-sh',
  '.md': 'text/markdown'
};

const pastebin = {
  user: async (user) => {
    try {
      const pageUrl = `${websiteUrl}/u/${user}`;
      const html = await (await fetch(pageUrl)).text();
      const $ = cheerio.load(html);
      const results = [];

      $('table.maintable tr').each((i, el) => {
        const titleElement = $(el).find('td:first-child a');
        const title = titleElement.text().trim();
        const path = titleElement.attr('href');
        const date = $(el).find('td:nth-child(2)').text().trim();
        const expiration = $(el).find('td:nth-child(3)').text().trim();
        
        if (title && path) {
          const url = {
            raw: `${websiteUrl}/raw${path}`,
            download: `${websiteUrl}/dl${path}`,
            link: `${websiteUrl}${path}`
          };

          results.push({ title, date, expiration, url });
        }
      });

      return results.length > 0 ? results : null;
    } catch (error) {
      console.error('Error fetching Pastebin user pastes:', error);
      return null;
    }
  },

  code: async (url) => {
    try {
      const body = await (await fetch(url)).text();
      return body;
    } catch (error) {
      console.error('Error fetching Pastebin code:', error);
      return null;
    }
  }
};

const handler = async (m, { text, conn }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ يرجى إدخال اسم مستخدم صالح.', m);
    }

    try {
        const search = await pastebin.user(text);
        if (!search) {
            return conn.reply(m.chat, `❌ المستخدم "${text}" لا يملك أي أكواد على Pastebin أو غير موجود.`, m);
        }

        const userFolder = path.join(__dirname, text);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        for (let i = 0; i < search.length; i++) {  
            const code = await pastebin.code(search[i].url.raw);
            if (!code) {
                continue;
            }

            const title = search[i].title;
            const fileExt = path.extname(title) || '.txt';
            const mimetype = mimeTypes[fileExt] || 'text/plain';

            const filePath = path.join(userFolder, title);
            fs.writeFileSync(filePath, code, 'utf8');
        }

        const zipFile = `${userFolder}.zip`;
        const zipCommand = `zip -r "${zipFile}" "${userFolder}"`;

        exec(zipCommand, async (error) => {
            if (error) {
                console.error('Error zipping folder:', error);
                return conn.reply(m.chat, '❌ حدث خطأ أثناء ضغط الملفات.', m);
            }

            const fileBuffer = fs.readFileSync(zipFile);
            await conn.sendMessage(m.chat, {
                document: fileBuffer,
                fileName: `${text}.zip`,
                mimetype: 'application/zip',
                caption: `📂 جميع أكواد المستخدم "${text}" مضغوطة في هذا الملف.`
            }, { quoted: m });

            fs.unlinkSync(zipFile);
            fs.rmSync(userFolder, { recursive: true, force: true });
        });

    } catch (error) {
        console.error('Error processing text:', error);
        conn.reply(m.chat, `❌ حدث خطأ: ${error.message}`, m);
    }
};

handler.command = /^(بستابين)$/i;
export default handler;