import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import FormData from 'form-data';
import fetch from 'node-fetch';
import crypto from 'crypto';
import util from 'util';
import { fileTypeFromBuffer } from 'file-type';
import { format } from 'util';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function makeTeleSocket(tokenOptions, options = {}) {

  const tele = new TelegramBot(tokenOptions, { polling: true });

  const sock = Object.defineProperties(tele, {


  });

  tele.on('polling_error', () => { }); // Silence Telegram errors in console

  return tele;
};


export function serializeTelegram(bot, msg) {
  if (!msg) return;

  const quotedMsg = msg.reply_to_message;

  const serialized = {
    id: msg.message_id,
    chat: msg.chat.id,
    chatType: msg.chat.type,
    sender: msg.from,
    fromMe: msg.from?.is_bot || false,
    isGroup: ['group', 'supergroup'].includes(msg.chat.type),
    text: msg.text || msg.caption || '',
    name: `${msg.from?.first_name || ''} ${msg.from?.last_name || ''}`.trim(),
    mentionedUsernames: msg.entities?.filter(e => e.type === 'mention') || [],
    mtype: (() => {
      const types = ['text', 'photo', 'video', 'audio', 'voice', 'document', 'sticker', 'animation'];
      return types.find(type => msg[type]) || 'unknown';
    })(),
    mediaMessage: (() => {
      const type = ['photo', 'video', 'audio', 'voice', 'document', 'sticker', 'animation'].find(t => msg[t]);
      return msg[type] || null;
    })(),

    // الرد على نفس الرسالة
    reply: async function (text, options = {}) {
      return bot.sendMessage(this.chat, text, { reply_to_message_id: this.id, ...options });
    },

    // إعادة توجيه الرسالة
    forward: async function (toChatId) {
      return bot.forwardMessage(toChatId, this.chat, this.id);
    },

    // تحميل الوسائط
    download: async function () {
      const type = this.mtype;
      const media = this.mediaMessage;
      const fileId = Array.isArray(media) ? media[media.length - 1]?.file_id : media?.file_id;

      if (!fileId) return null;
      const link = await bot.getFileLink(fileId);
      return link;
    },

    // الرسالة المقتبسة إن وُجدت
    quoted: quotedMsg
      ? {
        id: quotedMsg.message_id,
        text: quotedMsg.text || quotedMsg.caption || '',
        name: `${quotedMsg.from?.first_name || ''} ${quotedMsg.from?.last_name || ''}`.trim(),
        mtype: (() => {
          const types = ['text', 'photo', 'video', 'audio', 'voice', 'document', 'sticker', 'animation'];
          return types.find(type => quotedMsg[type]) || 'unknown';
        })(),
        mediaMessage: (() => {
          const type = ['photo', 'video', 'audio', 'voice', 'document', 'sticker', 'animation'].find(t => quotedMsg[t]);
          return quotedMsg[type] || null;
        })(),
        download: async function () {
          const type = this.mtype;
          const media = this.mediaMessage;
          const fileId = Array.isArray(media) ? media[media.length - 1]?.file_id : media?.file_id;

          if (!fileId) return null;
          const link = await bot.getFileLink(fileId);
          return link;
        },
        reply: async function (text, options = {}) {
          return bot.sendMessage(msg.chat.id, text, { reply_to_message_id: quotedMsg.message_id, ...options });
        },
      }
      : null,
  };

  return serialized;
}