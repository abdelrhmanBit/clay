import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import JavaScriptObfuscator from 'javascript-obfuscator'

let handler = async (m, { command, text, conn }) => {
  const quotedCode = m.quoted?.text ?? ''
  const [mode, levelStr, ...codeParts] = text.trim().split(' ')
  const level = parseInt(levelStr) || 1
  const deficitCode = codeParts.join(' ')
  const sourceCode = (deficitCode || quotedCode).trim()
  const normalizedMode = (mode || '').toLowerCase()

  if (!sourceCode) {
    return m.reply('قم بالرد على الكود الذي تريد تشفيره أو فك تشفيره.')
  }

  // إعدادات التشفير حسب المستوى
  let options
  switch (level) {
    case 1:
      options = { compact: true, selfDefending: false }
      break
    case 2:
      options = { compact: true, controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.5 }
      break
    case 3:
      options = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        stringArray: true,
        stringArrayThreshold: 0.75,
      }
      break
    case 4:
      options = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.7,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        splitStrings: true,
        splitStringsChunkLength: 5,
        transformObjectKeys: true,
      }
      break
    case 5:
      options = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        splitStrings: true,
        splitStringsChunkLength: 3,
        transformObjectKeys: true,
        disableConsoleOutput: true,
      }
      break
    default:
      options = { compact: true, selfDefending: false }
  }

  // رسالة تفاعلية إذا لم يتم تحديد الإجراء
  if (!['encrypt', 'decrypt'].includes(normalizedMode)) {
    const encryptionRows = [1, 2, 3, 4, 5].map(lvl => ({
      header: 'تشفير',
      title: `encrypt ${lvl}`,
      description: `تشفير الكود - مستوى ${lvl}`,
      id: `.تشفير encrypt ${lvl} ${quotedCode} ${deficitCode}`
    }))

    const interactiveMessage = {
      body: { text: '*—◉ اختر العملية ومستوى التشفير:*' },
      footer: { text: `${global.wm || 'JavaScript Obfuscator Bot'}` },
      header: {
        title: '*< تشفير أو فك تشفير كود JavaScript >*',
        hasMediaAttachment: false,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'خيارات التشفير',
              sections: [
                {
                  title: 'اختر الإجراء والمستوى',
                  rows: [
                    ...encryptionRows,
                    {
                      header: 'فك التشفير (تجريبي)',
                      title: 'decrypt',
                      description: 'محاولة فك التشفير (محدود)',
                      id: `.تشفير decrypt ${quotedCode} ${deficitCode}`
                    }
                  ]
                }
              ]
            })
          }
        ],
        messageParamsJson: ''
      }
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: { interactiveMessage }
      }
    }, { userJid: conn.user.jid, quoted: m })

    return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }


  // التشفير
  if (normalizedMode === 'encrypt') {
    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, options)
      const obfuscatedCode = obfuscated.getObfuscatedCode()

      if (obfuscatedCode.length > 4096) {
        return conn.sendMessage(m.chat, {
          document: Buffer.from(obfuscatedCode),
          fileName: `encrypted-level${level}.js`,
          mimetype: 'application/javascript'
        }, { quoted: m })
      } else {
        return m.reply(`\`\`\`\n${obfuscatedCode}\n\`\`\``)
      }
    } catch (e) {
      return m.reply(`❌ حدث خطأ أثناء التشفير:\n${e.message}`)
    }
  }

  // فك التشفير
  if (normalizedMode === 'decrypt') {
  try {
  
   const arrayFuncMatch = sourceCode.match(/function (\w+)\(\)\s*{\s*const \w+\s*=\s*\[\s*(['"`].*?['"`]\s*,?\s*)+\];/s);
   if (!arrayFuncMatch) {
     return m.reply('لم يتم العثور على دالة مصفوفة النصوص.');
   }
    
   const arrayFuncName = arrayFuncMatch[1];
   
   const arrayRaw = sourceCode.match(new RegExp(`function ${arrayFuncName}\\(\\)\\s*{\\s*const \\w+\\s*=\\s*(\\[.*?\\]);`, 's'));
    if (!arrayRaw) {
      return m.reply('لم يتم العثور على مصفوفة النصوص.');
    }
    
    let arrayValues;
    try {
      arrayValues = eval(arrayRaw[1]);
    } catch (err) {
      console.error('فشل تحويل المصفوفة:', err);
      return m.reply('فشل تحويل المصفوفة:' + err.message);
    }
    
    const decoderFuncMatch = sourceCode.match(/function (\w+)\(\w+\)\s*{\s*\w+\s*=\s*\w+\s*-\s*(0x[a-fA-F0-9]+);\s*return\s+\w+\[\w+\];\s*}/);
    
    if (!decoderFuncMatch) {
       return m.reply('لم يتم العثور على دالة فك الشيفرة.');
    }
    
    const decoderFuncName = decoderFuncMatch[1];
    const offset = parseInt(decoderFuncMatch[2], 16);
    
    const result = sourceCode.replace(new RegExp(`${decoderFuncName}\\(0x([a-fA-F0-9]+)\\)`, 'g'), (_, hex) => {
      const index = parseInt(hex, 16) - offset;
      return arrayValues[index] ? '`' + arrayValues[index] + '`' : 'undefined';
    });
    
    const cleanCode = result
    .replace(new RegExp(`function ${arrayFuncName}\\([\\s\\S]*?}\\s*`, 'g'), '')
    .replace(new RegExp(`function ${decoderFuncName}\\([\\s\\S]*?}\\s*`, 'g'), '');

    return m.reply(`\`\`\`\n${cleanCode}\n\`\`\``);

  } catch (e) {
    return m.reply(`❌ حدث خطأ أثناء فك التشفير:\n${e.message}`);
  }
}
};

handler.command = ['تشفير'];
export default handler;