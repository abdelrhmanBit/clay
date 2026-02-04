"use strict";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Allow self-signed certs (common fixes)
import './config.js';
import './setting.js';
//import './telegram.js';
import mongoose from 'mongoose';
import Nodeactyl from 'nodeactyl';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { format } from 'util';
import util from 'util';
import fs from 'fs';
import pino from 'pino';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './libraries/simple.js';
//import {makeTeleSocket} from './libraries/telegram.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import store from './libraries/store.js';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import("@whiskeysockets/baileys");
import TelegramBot from 'node-telegram-bot-api';

import readline from 'readline';
import NodeCache from 'node-cache';

const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
let stopped = 'close';

protoType();
serialize();

const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.timestamp = { start: new Date };



const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());


global.prefix = new RegExp('^[' + (opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-.@').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');


// --- Database Initialization ---
const dbAdapter = /https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`database.json`);
const defaultDbData = {
  users: {},
  chats: {},
  stats: {},
  msgs: {},
  sticker: {},
  error: {},
  settings: {}
};
global.db = new Low(dbAdapter, defaultDbData);

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }

  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;

  global.db.data = {
    ...defaultDbData,
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};

const chataiAdapter = new JSONFile(path.join(__dirname, 'Ai_database.json'));
const defaultChataiData = { users: {} };
global.chatai = new Low(chataiAdapter, defaultChataiData);

global.loadChatai = async function loadChatai() {
  if (global.chatai.READ) {
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.chatai.READ) {
          clearInterval(this);
          resolve(global.chatai.data === null ? global.loadChatai() : global.chatai.data);
        }
      }, 1 * 1000));
  }

  if (global.chatai.data !== null) return;
  global.chatai.READ = true;
  await global.chatai.read().catch(console.error);
  global.chatai.READ = null;

  global.chatai.data = {
    users: {},
    ...(global.chatai.data || {}),
  };
  global.chatai.chain = lodash.chain(global.chatai.data);
};



global.getDataUser = async function getDataUser(person) {

  if (person.endsWith('@s.whatsapp.net')) {
    person = person.split('@')[0];
  }

  if (!person.startsWith('+')) {
    person = '+' + person;
  }

  try {
    const countryUrl = global.cuntryUrl;
    const response = await fetch(countryUrl);
    const data = await response.json();

    for (const key in data) {
      if (person.startsWith(data[key].dialCode)) {
        return data[key];
      }
    }

    throw new Error('لم يتم العثور على دولة مناسبة لهذا الرقم');
  } catch (error) {
    console.error(error.message);
    return {
      name: 'Egypt',
      dialCode: '+20',
      emoji: '🇪🇬',
      code: 'EG',
      timezone: 'Africa/Cairo',
      language: 'Arabic',
      languageCode: 'ar'
    };
  }
};

loadDatabase();
loadChatai();

console.log(chalk.yellow('Starting System...'));

// --- Authentication ---
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);

const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botnumber || process.argv.find(arg => /^\+\d+$/.test(arg));

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = async (texto) => new Promise((resolver) => rl.question(texto, resolver))


let opcion
if (methodCodeQR) {
  opcion = '1'
}

/*                                               */

if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {

  do {

    opcion = await question(chalk.yellowBright.bold('┌「 Select an option 」─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ ') + chalk.white.bold('1- Code QR\n') + chalk.yellowBright.bold('│✑ ') + chalk.white.bold('2- Code 8 Numbers\n') + chalk.yellowBright.bold('└─────────┈ ⳹\n\n'));

    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.yellowBright.bold('\n┌「 Select number option only 」─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ ') + chalk.white.bold('1- to choose Code QR\n') + chalk.yellowBright.bold('│✑ ') + chalk.white.bold('2- to choose Code 8 Numbers\n') + chalk.yellowBright.bold('└─────────┈ ⳹\n\n'))
    }

  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

console.info = () => { }

// --- Connection Options ---
const connectionOptions = {
  logger: Pino({ level: 'silent' }),
  printQRInTerminal: opcion === '1' || methodCodeQR,
  mobile: MethodMobile,
  browser: ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'fatal' }).child({ level: 'fatal' })),
  },
  // waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (key) => {
    let jid = jidNormalizedUser(key.remoteJid);
    let msg = await store.loadMessage(jid, key.id);
    return msg?.message || "";
  },
  patchMessageBeforeSending: async (message) => {
    let messages = 0;
    global.conn.uploadPreKeysToServerIfRequired();
    messages++;
    return message;
  },
  msgRetryCounterCache: msgRetryCounterCache,
  userDevicesCache: userDevicesCache,
  //msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
  version,
};

console.log(chalk.yellow('Connecting to WhatsApp...'));
global.conn = makeWASocket(connectionOptions);

if (global.telegramToken) {
  if (!global.tele) {
    console.log(chalk.yellow('Starting Telegram Bot...'));
    try {
      global.tele = new TelegramBot(global.telegramToken, { polling: true });
      console.log(chalk.bold.green('Telegram Bot Connected.'));

      // Error handling for telegram to suppress [Telegram Error] ETELEGRAM
      global.tele.on('polling_error', (error) => {
        if (!error.message?.includes('ETELEGRAM') && error.code !== 'ETELEGRAM') {
          console.error('[Telegram Error]', error.code || error.message);
        }
      });
      global.tele.on('webhook_error', (error) => {
        if (!error.message?.includes('ETELEGRAM') && error.code !== 'ETELEGRAM') {
          console.error('[Telegram Webhook Error]', error.code || error.message);
        }
      });
    } catch (e) {
      console.error('Failed to start Telegram Bot:', e);
    }
  }
} else {
  console.log(chalk.yellow('No Telegram Token found.'));
}

if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!conn.authState.creds.registered) {

      if (MethodMobile) throw new Error('The pairing token cannot be used with the mobile API.')

      let numeroTelefono
      if (!!phoneNumber) {
        numeroTelefono = phoneNumber.replace(/[^0-9]/g, '')
        if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {

          console.log(chalk.yellowBright.bold('\n┌「 Start with the country code of your WhatsApp number 」─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ Example : ') + chalk.white.bold('+201145624848\n') + chalk.yellowBright.bold('└─────────┈ ⳹\n\n'));

          process.exit(0)

        }
      } else {

        while (true) {

          numeroTelefono = await question(chalk.yellowBright.bold('\n┌「 Add your number 」─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ Example : ') + chalk.white.bold('+201025202223\n') + chalk.yellowBright.bold('└─────────┈ ⳹\n\n'));

          numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '')

          if (numeroTelefono.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
            break
          } else {
            console.log(chalk.yellowBright.bold('\n┌「 Add your number 」─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ Example : ') + chalk.white.bold('+201025202223\n') + chalk.yellowBright.bold('└─────────┈ ⳹\n\n'));

          }
        }
        rl.close()
      }

      setTimeout(async () => {
        try {
          // Purge session files if we are not registered and about to request a code
          // This ensures a clean slate for the pairing process
          try {
            let directorio = fs.readdirSync(`./${global.authFile}`)
            directorio.forEach(file => {
              if (file !== 'creds.json') fs.unlinkSync(`./${global.authFile}/${file}`)
            })
          } catch (e) { }

          let attempts = 0;
          let waits = 0;
          const maxAttempts = 3;
          const maxWaits = 5;
          const retryDelay = 7000;
          const socketWaitTimeout = 5000;

          const isSocketOpen = () => global.conn?.ws?.readyState === 1;

          const waitForSocketOpen = () => new Promise((resolve) => {
            if (isSocketOpen()) return resolve(true);
            const start = Date.now();
            const interval = setInterval(() => {
              if (isSocketOpen()) {
                clearInterval(interval);
                resolve(true);
                return;
              }
              if (Date.now() - start >= socketWaitTimeout) {
                clearInterval(interval);
                resolve(false);
              }
            }, 500);
          });

          async function requestPairing() {
            if (global.conn.authState.creds.registered) return;
            const ready = await waitForSocketOpen();
            if (!ready) {
              waits++;
              console.warn(chalk.yellow(`[Pairing] Connection not ready. Wait ${waits} of ${maxWaits}.`));
              if (waits < maxWaits) {
                setTimeout(requestPairing, retryDelay);
              }
              return;
            }
            try {
              let codigo = await global.conn.requestPairingCode(numeroTelefono)
              codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo
              console.log(chalk.yellowBright.bold('\n┌─────〘 Use Code Linked To WhatsApp 〙─────────┈ ⳹\n') + chalk.yellowBright.bold('│✑ Code : ') + chalk.white.bold(codigo + '\n') + chalk.yellowBright.bold('└────────────────┈ ⳹\n\n'))
            } catch (e) {
              attempts++;
              console.error(chalk.red(`[Pairing Error] Attempt ${attempts} failed: ${e.message}`));
              if (attempts < maxAttempts && !global.conn.authState.creds.registered) {
                console.log(chalk.yellow(`Retrying in ${retryDelay / 1000}s...`));
                setTimeout(requestPairing, retryDelay);
              }
            }
          }
          await requestPairing();
        } catch (e) {
          console.error(chalk.red(`[Pairing Error] Unexpected error: ${e.message}`));
        }
      }, 5000)

    }
  }
}

/*                                               */

conn.isInit = false;
conn.well = false;

/*                                               */

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp']) await clearTmp();
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./Qr.js')).default(global.conn, PORT);

/*                                               */

async function clearTmp() {
  const tmpDirs = [global.tmpFile, global.linkedFile]; // Check both tmp and linked dirs
  for (const dir of tmpDirs) {
    const absolutePath = path.join(__dirname, dir);
    if (!existsSync(absolutePath)) continue;

    try {
      const files = await fs.promises.readdir(absolutePath);
      for (const file of files) {
        const filePath = path.join(absolutePath, file);
        try {
          const stats = await fs.promises.stat(filePath);
          // Delete files older than 3 minutes
          if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) {
            await fs.promises.unlink(filePath);
          }
        } catch (e) {
          console.error(`Error processing file ${filePath}:`, e.message);
        }
      }
    } catch (e) {
      console.error(`Error reading directory ${absolutePath}:`, e.message);
    }
  }
}


const dirToWatchccc = path.join(__dirname, './');
function deleteCoreFiles(filePath) {
  const coreFilePattern = /^core\.\d+$/i;
  const filename = path.basename(filePath);
  if (coreFilePattern.test(filename)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`File deletion error ${filePath} : `, err);
      } else {
        console.log(`The file has been deleted : ${filePath}`);
      }

    });
  }
}

fs.watch(dirToWatchccc, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(dirToWatchccc, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        deleteCoreFiles(filePath);
      }
    });
  }
});

function purgeSession() {
  let prekey = []
  let directorio = readdirSync(`./${global.authFile}`)
  let filesFolderPreKeys = directorio.filter(file => {
    return file.startsWith('pre-key-') || file.startsWith('session-') || file.startsWith('sender-') || file.startsWith('app-')
  })
  prekey = [...prekey, ...filesFolderPreKeys]
  filesFolderPreKeys.forEach(files => {
    unlinkSync(`./${global.authFile}/${files}`)
  })
}

function purgeSessionSB() {
  try {
    let listaDirectorios = readdirSync(`./${global.linkedFile}/`);
    let SBprekey = []
    listaDirectorios.forEach(directorio => {
      if (statSync(`./${global.linkedFile}/${directorio}`).isDirectory()) {
        let DSBPreKeys = readdirSync(`./${global.linkedFile}/${directorio}`).filter(fileInDir => {
          return fileInDir.startsWith('pre-key-') || fileInDir.startsWith('app-') || fileInDir.startsWith('session-')
        })
        SBprekey = [...SBprekey, ...DSBPreKeys]
        DSBPreKeys.forEach(fileInDir => {
          unlinkSync(`./${global.linkedFile}/${directorio}/${fileInDir}`)
        })
      }
    })
    if (SBprekey.length === 0) return; //console.log(chalk.cyanBright(`=> No hay archivos por eliminar.`))
  } catch (err) {
    console.log(chalk.bold.red(`An error occurred while deleting, the files were not deleted.`))
  }
}

function purgeOldFiles() {
  const directories = [`./${global.authFile}/`, `./${global.linkedFile}/`]
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        const filePath = path.join(dir, file)
        stat(filePath, (err, stats) => {
          if (err) throw err;
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath, err => {
              if (err) throw err;
              console.log(chalk.bold.green(`The file has been deleted [${file}] Successfully`))
            })
          } else {
            console.log(chalk.bold.red(`The file has not been deleted [${file}] because of : ` + err))
          }
        })
      })
    })
  })
}

/*                                               */

async function teleConnectionUpdate(update) {

}

async function waConnectionUpdate(update) {


  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.yellow('Scan the QR code.'));
    }
  }

  if (connection == 'open') {
    console.log(chalk.bold.green('Connection WhatsApp Bot successful.\n\n'));
  }

  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

  if (reason == 405) {
    // Backup creds before deleting
    const credsPath = `./${global.authFile}/creds.json`;
    const backupPath = `./${global.authFile}/creds.backup_${Date.now()}.json`;
    if (fs.existsSync(credsPath)) {
      fs.renameSync(credsPath, backupPath);
      console.log(chalk.bold.yellow(`[ ℹ️ ] Session backed up to ${backupPath} before deletion.`));
    }

    // await fs.unlinkSync(`./${global.authFile}/` + "creds.json") // Already renamed/moved

    console.log(chalk.bold.redBright(`[ ⚠ ] The connection has been replaced, please wait a moment I will restart...\n If errors occur, please start again using : npm start`))

    process.send('reset')
  }

  if (connection === 'close') {

    if (reason === DisconnectReason.badSession) {
      conn.logger.error(`[ ⚠ ] Invalid session, please delete the folder ${global.authFile} And re-scan again.`);
      //process.exit();
    } else if (reason === DisconnectReason.connectionClosed) {
      conn.logger.warn(`[ ⚠ ] Connection is closed, reconnecting...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      conn.logger.warn(`[ ⚠ ] Lost connection to server, trying to reconnect...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      conn.logger.error(`[ ⚠ ] The connection has been replaced, a new session has been opened. Please close the current session first.`);
      process.exit(1);
    } else if (reason === DisconnectReason.loggedOut) {
      conn.logger.error(`[ ⚠ ] Connection is closed, please delete the folder ${global.authFile} And re-scan again.`);
      //process.exit();
    } else if (reason === DisconnectReason.restartRequired) {
      conn.logger.info(`[ ⚠ ] Restart required, please restart the server if you encounter any issues.`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut) {
      conn.logger.warn(`[ ⚠ ] Connection timed out, reconnecting...`);
      await global.reloadHandler(true).catch(console.error);
    } else {
      conn.logger.warn(`[ ⚠ ] The reason for the breakup is unknown.\n${reason || ''} :  ${connection || ''}`);
      await global.reloadHandler(true).catch(console.error);
    }

  }

}

/*                                               */

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Uncaught Exception: ${util.format(err)}\n`);
  // Don't exit, try to keep running if possible, but extremely critical errors might require a restart manually
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  fs.appendFileSync('error_log.txt', `${new Date().toISOString()} - Unhandled Rejection: ${util.format(reason)}\n`);
  // Don't exit
});

/*                                               */

let isInit = true;

/*                                               */

let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {

  try {

    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);

    if (Object.keys(Handler || {}).length) handler = Handler;

  } catch (e) {
    console.error(e);
  }

  if (restatConn) {
    const oldChats = global.conn.chats;
    //const teleoldChats = global.tele.chats;
    try {
      global.conn.ws.close();
    } catch { }

    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    store?.bind(conn);

    //tele.removeAllListeners();
    //global.tele = makeTeleSocket(global.telegramToken);

    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.whatsapp);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.waConnectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);

    //tele.off('webhook_error', tele.teleConnectionUpdate);
    //tele.off('polling_error', tele.teleConnectionUpdate);
    if (global.tele) {
      global.tele.removeListener('message', global.tele.telegram);
    }
  }

  conn.welcome = '👋 مرحباً بك!\n@user';
  conn.bye = '👋 إلى اللقاء!\n@user';
  conn.spromote = '*[ ℹ️ ] @user تمت ترقيته إلى مشرف.*';
  conn.sdemote = '*[ ℹ️ ] @user تم تخفيضه من مشرف.*';
  conn.sDesc = '*[ ℹ️ ] تم تعديل وصف المجموعة.*';
  conn.sSubject = '*[ ℹ️ ] تم تعديل اسم المجموعة.*';
  conn.sIcon = '*[ ℹ️ ] تم تغيير صورة الملف الشخصي للمجموعة.*';
  conn.sRevoke = '*[ ℹ️ ] تم إعادة تعيين رابط دعوة المجموعة.*';


  // Ensure event listeners are attached even during the connecting phase
  conn.whatsapp = handler.whatsapp.bind(global.conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.waConnectionUpdate = waConnectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  if (global.tele) {
    global.tele.telegram = handler.telegram.bind(global.tele);
    global.tele.on('message', global.tele.telegram);
  }

  // Optional: A minimal guard for specific operations if needed later
  global.isConnReady = () => global.conn?.ws?.socket?.readyState === 1;

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.whatsapp);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.waConnectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  //tele.on('webhook_error', tele.teleConnectionUpdate);
  //tele.on('polling_error', tele.teleConnectionUpdate);
  //tele.on('message', tele.telegram);

  isInit = false;
  return true;
};

/*                                               */

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }

  }
}

/*                                               */

filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

/*                                               */

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`);
      else {
        conn.logger.warn(`deleted plugin - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`new plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};

/*                                               */

Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}

/*                                               */

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  await clearTmp();
  // await purgeSession();
}, 185000);

/*                                               */

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `Activity At: ${uptime}`;
  await conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);

/*                                               */

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, ' D ️', h, ' H ', m, ' M ', s, ' S '].map((v) => v.toString().padStart(2, 0)).join('');
}
_quickTest().catch(console.error);
