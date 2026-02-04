/*
@ ArabDevs Scrape

# Ai -> 
- chat text or voice.
- genreat image.

Created by :

- https://whatsapp.com/channel/0029Vb5u2oNJ3juwGBYtXF1G
- https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11

*/


import axios from "axios";

const pollinations = {
  api: {
    chat: "https://text.pollinations.ai",
    image: "https://image.pollinations.ai/prompt",
    voice: "https://text.pollinations.ai"
  },

  header: {
    'Connection': 'keep-alive',
    'sec-ch-ua-platform': '"Android"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="136", "Android WebView";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'Accept': '*/*',
    'Origin': 'https://freeai.aihub.ren',
    'X-Requested-With': 'mark.via.gp',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://freeai.aihub.ren/',
    'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7'
  },

  models: {
chat: [
            {
                name: "openai",
                type: "chat",
                censored: true,
                description: "OpenAI GPT-4o-mini",
                baseModel: true,
                vision: true,
                group: "OpenAI"
            },
            {
                name: "openai-large",
                type: "chat",
                censored: true,
                description: "OpenAI GPT-4o",
                baseModel: true,
                vision: true,
                group: "OpenAI"
            },
            {
                name: "openai-reasoning",
                type: "chat",
                censored: true,
                description: "OpenAI o1-mini",
                baseModel: true,
                reasoning: true,
                group: "OpenAI"
            },
            {
                name: "openai-reasoning",
                type: "chat",
                censored: true,
                description: "OpenAI o3-mini",
                baseModel: true,
                reasoning: true,
                vision: true,
                group: "OpenAI"
            },
            {
                name: "qwen-coder",
                type: "chat",
                censored: true,
                description: "Qwen 2.5 Coder 32B",
                baseModel: true,
                group: "Qwen"
            },
            {
                name: "llama",
                type: "chat",
                censored: false,
                description: "Llama 3.3 70B",
                baseModel: true,
                group: "Meta"
            },
            {
                name: "mistral",
                type: "chat",
                censored: false,
                description: "Mistral Nemo",
                baseModel: true,
                group: "Mistral"
            },
            {
                name: "deepseek",
                type: "chat",
                censored: true,
                description: "DeepSeek-V3",
                baseModel: true,
                group: "DeepSeek"
            },
            {
                name: "claude",
                type: "chat",
                censored: true,
                description: "Claude 3.5 Haiku",
                baseModel: true,
                group: "Anthropic"
            },
            {
                name: "deepseek-r1",
                type: "chat",
                censored: true,
                description: "DeepSeek-R1 Distill Qwen 32B",
                baseModel: true,
                reasoning: true,
                provider: "cloudflare",
                group: "DeepSeek"
            },
            {
                name: "deepseek-reasoner",
                type: "chat",
                censored: true,
                description: "DeepSeek R1 - Full",
                baseModel: true,
                reasoning: true,
                provider: "deepseek",
                group: "DeepSeek"
            },
            {
                name: "deepseek-r1-llama",
                type: "chat",
                censored: true,
                description: "DeepSeek R1 - Llama 70B",
                baseModel: true,
                reasoning: true,
                provider: "scaleway",
                group: "DeepSeek"
            },
            {
                name: "llamalight",
                type: "chat",
                censored: false,
                description: "Llama 3.1 8B Instruct",
                baseModel: true,
                group: "Meta"
            },
            {
                name: "gemini",
                type: "chat",
                censored: true,
                description: "Gemini 2.0 Flash",
                baseModel: true,
                provider: "google",
                group: "Google"
            },
            {
                name: "gemini-thinking",
                type: "chat",
                censored: true,
                description: "Gemini 2.0 Flash Thinking",
                baseModel: true,
                provider: "google",
                group: "Google"
            },
            {
                name: "phi",
                type: "chat",
                censored: true,
                description: "Phi-4 Multimodal Instruct",
                baseModel: true,
                group: "Microsoft"
            }
],
chatFile: [
           {
             name: "openai-large",
             type: "gpt-4.1"
           },
           {
             name: "openai",
             type: "gpt-4.1-mini"
           },
           {
             name: "openai-fast",
             type: "gpt-4.1-nano"
           }
],

image: [
            {
                name: "flux",
                type: "image",
                censored: true,
                description: "Universal model, suitable for most scenarios",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "FLUX-3D",
                type: "image",
                censored: true,
                description: "Model optimized for 3D rendering style",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "FLUX-PRO",
                type: "image",
                censored: true,
                description: "Provides professional quality advanced models",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-realism",
                type: "image",
                censored: true,
                description: "Focus on realistic image generation",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-anime",
                type: "image",
                censored: true,
                description: "Optimized for generating anime-style images",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "Flux-cablyai",
                type: "image",
                censored: true,
                description: "Models with special artistic style",
                baseModel: true,
                vision: true,
                group: "Flux"
            },
            {
                name: "turbo",
                type: "image",
                censored: true,
                description: "Generate models quickly, speed first",
                baseModel: true,
                vision: true,
                group: "Turbo"
            }
],
voice: [
  {
    "name": "Alloy",
    "desc": "平衡中性",
    "value": "alloy"
  },
  {
    "name": "Echo",
    "desc": "深沉有力",
    "value": "echo"
  },
  {
    "name": "Fable",
    "desc": "温暖讲述",
    "value": "fable"
  },
  {
    "name": "Onyx",
    "desc": "威严庄重",
    "value": "onyx"
  },
  {
    "name": "Nova",
    "desc": "友好专业",
    "value": "nova"
  },
  {
    "name": "Shimmer",
    "desc": "轻快明亮",
    "value": "shimmer"
  },
  {
    "name": "Coral",
    "desc": "温柔平静",
    "value": "coral"
  },
  {
    "name": "Verse",
    "desc": "生动诗意",
    "value": "verse"
  },
  {
    "name": "Ballad",
    "desc": "抒情柔和",
    "value": "ballad"
  },
  {
    "name": "Ash",
    "desc": "思考沉稳",
    "value": "ash"
  },
  {
    "name": "Sage",
    "desc": "智慧老练",
    "value": "sage"
  },
  {
    "name": "Amuch",
    "desc": "饱满自然",
    "value": "amuch"
  },
  {
    "name": "Aster",
    "desc": "清晰直接",
    "value": "aster"
  },
  {
    "name": "Brook",
    "desc": "流畅舒适",
    "value": "brook"
  },
  {
    "name": "Clover",
    "desc": "活泼年轻",
    "value": "clover"
  },
  {
    "name": "Dan",
    "desc": "男声稳重",
    "value": "dan"
  },
  {
    "name": "Elan",
    "desc": "优雅流利",
    "value": "elan"
  }
]
  },

  chat: async (question, modelIndex = 0) => {
    const model = pollinations.models.chat[modelIndex]?.name || "openai";
    try {
      
      const apiUrl = pollinations.api.chat;
      const headers = pollinations.header;
      
      const response = await axios.get(`${apiUrl}/${encodeURIComponent(question)}`, {
       params: {
         'model': model
       },
         headers: headers
       });
      

      return response.data;
    } catch (error) {
      return error.message || "chat request failed";
    }
  },

  chatFile: async (question, option = {}) => {
    const modelIndex = option.model;
    const systemMessage = option.messages;
    const image = option.image;
    
    try {
    
    const model = pollinations.models.chatFile[modelIndex]?.name || "openai";
    
    const messages = [
            ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
            {
                role: 'user',
                content: [
                    { type: 'text', text: question },
                    ...(image ? [{
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${image.toString('base64')}` }
                    }] : [])
                ]
            }
        ];
        
    const { data } = await axios.post('https://text.pollinations.ai/openai', {
            messages,
            model: model,
            temperature: 0.5,
            presence_penalty: 0,
            top_p: 1,
            frequency_penalty: 0
        }, {
            headers: pollinations.header
        });
        
        return data.choices[0].message.content;
        
    } catch (error) {
      return error.message || "chat request failed";
    }
    
  },

  image: async (prompt, modelIndex = 0, option = {}) => {
    const model = pollinations.models.image[modelIndex]?.name || "flux";
    const params = {
      prompt,
      model,
      width: option.width || "720",
      height: option.height || "1280",
      seed: option.seed ?? Math.floor(Math.random() * 2147483647),
      nologo: option.nologo ?? true,
      safe: option.safe ?? false,
      negative_prompt: option.negative_prompt || "worst quality, blurry"
    };

    let imageUrl = `${pollinations.api.image}/${encodeURIComponent(params.prompt)}`;
    imageUrl += `?width=${params.width}&height=${params.height}&seed=${params.seed}&model=${params.model}`;
    imageUrl += `&negative_prompt=${encodeURIComponent(params.negative_prompt)}`;
    imageUrl += `&nologo=${params.nologo}`;
    imageUrl += `&safe=${params.safe}`;

    return imageUrl;
  },

  voice: async (text, modelIndex = 0) => {
    const voice = pollinations.models.voice[modelIndex]?.value || "alloy";
    
    let voiceUrl = `${pollinations.api.voice}/${encodeURIComponent(text)}`;
    voiceUrl += `?model=openai-audio&voice=${voice}`;
    
    
    return voiceUrl;
  }
};

/*
Example Usege :

const chatRes = await pollinations.chat("hi", 5);
const imageRes = await pollinations.image("cat sleeping", 4);
const voiceRes = await pollinations.voice("Who are you", 5);

await m.reply(chatRes);
await conn.sendMessage(m.chat, {image: {url: imageRes}}, {quoted: m});
await conn.sendMessage(m.chat, { audio: {url: voiceRes}, mimetype: 'audio/mpeg' , ptt: true}, { quoted: m });

*/

const handler = async (m, { conn, usedPrefix, command, text }) => {
  const [subcmd, ...rest] = text.trim().split(/\s+/);
  const input = rest.join(' ');

  if (!subcmd) {
    return conn.sendMessage(
      m.chat,
      { text: `استخدام صحيح:
${usedPrefix}بولين شات <رقم الموديل|سؤالك>
${usedPrefix}بولين صور <رقم الموديل|وصف الصورة>
${usedPrefix}بولين صوت <رقم الموديل|نص لتحويله لصوت>
${usedPrefix}بولين موديلات <عرض الموديلات>` },
      { quoted: m }
    );
  }

  try {
    switch (subcmd) {
      case 'شات': {
        const [indexStr, ...msgParts] = input.split('|');
        const msg = msgParts.length ? msgParts.join('|').trim() : indexStr.trim();
        const modelIndex = parseInt(indexStr.trim());
        let reply;
        if (m.quoted) {
        const img = await m.quoted.download();
        reply = await pollinations.chatFile(msg, {model: isNaN(modelIndex) ? 0 : modelIndex, messages: null, image: img});
        } else {
        reply = await pollinations.chat(msg, isNaN(modelIndex) ? 0 : modelIndex);
        }
        
        await conn.sendMessage(m.chat, { text: reply }, { quoted: m });
        break;
      }
      case 'صور': {
        const [indexStr, ...promptParts] = input.split('|');
        const prompt = promptParts.length ? promptParts.join('|').trim() : indexStr.trim();
        const modelIndex = parseInt(indexStr.trim());
        const imageUrl = await pollinations.image(prompt, isNaN(modelIndex) ? 0 : modelIndex);
        await conn.sendMessage(m.chat, { image: { url: imageUrl } }, { quoted: m });
        break;
      }
      case 'صوت': {
        const [indexStr, ...textParts] = input.split('|');
        const voiceText = textParts.length ? textParts.join('|').trim() : indexStr.trim();
        const modelIndex = parseInt(indexStr.trim());
        const audioUrl = await pollinations.voice(voiceText, isNaN(modelIndex) ? 0 : modelIndex);
        await conn.sendMessage(
          m.chat,
          { audio: { url: audioUrl }, mimetype: 'audio/mpeg', ptt: true },
          { quoted: m }
        );
        break;
      }
      case 'موديلات': {
        const chatModels = pollinations.models.chat.map((m, i) => `🧠 شات ${i}: ${m.name}`).join('\n');
        const imageModels = pollinations.models.image.map((m, i) => `🖼️ صور ${i}: ${m.name}`).join('\n');
        const voiceModels = pollinations.models.voice.map((v, i) => `🎤 صوت ${i}: ${v.value}`).join('\n');
        const message = `📋 قائمة الموديلات المتاحة:

${chatModels}

${imageModels}

${voiceModels}

ℹ️ يمكنك اختيار الموديل باستخدام رقمه وكتابته قبل الطلب مفصول بـ | مثل:
${usedPrefix}بولين شات 0|ما هو الذكاء الاصطناعي؟`;
        await conn.sendMessage(m.chat, { text: message }, { quoted: m });
        break;
      }
      default: {
        await conn.sendMessage(m.chat, { text: 'الأمر غير معروف، الأوامر المتاحة: شات، صور، صوت، موديلات' }, { quoted: m });
      }
    }
  } catch (err) {
    console.error('Handler error:', err);
    await conn.sendMessage(m.chat, { text: 'حدث خطأ أثناء الإجابة.' }, { quoted: m });
  }
};

handler.help = ['بولين شات <رقم|سؤالك>', 'بولين صور <رقم|الوصف>', 'بولين صوت <رقم|النص>', 'بولين موديلات'];
handler.tags = ['ai'];
handler.command = ['بولين'];

export default handler;