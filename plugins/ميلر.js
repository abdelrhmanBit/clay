import nodemailer from 'nodemailer'

let handler = async (m, { text, args }) => {
  if (!text) return m.reply('اكتب الرقم اللي مطلوب فك التخمين له')

  const accounts = [
    {
      user: 'amamaywlylt@gmail.com',
      pass: 'kmdr ptne vmol cfqc'
    },
    {
      user: 'momskoe4@gmail.com',
      pass: 'karf vfrs ndnj kjdv'
    },
    {
      user: 'adam01091183808@gmail.com',
      pass: 'qpzh sfxy pcad sqlw'
    },
    {
      user: 'hjjckwms@gmail.com',
      pass: 'aeeq lwvd osqw ggsy'
    },
    {
      user: 'sjjdjkw704@gmail.com',
      pass: 'qvfo cmju ivck kspw'
    },
    {
      user: 'hdhbjdjdj75@gmail.com',
      pass: 'dxam ocrt wwvp hwta'
    },
    {
      user: 'iopqpsl900@gmail.com',
      pass: 'iqhh tyqx knri vcgj'
    },
    {
      user: 'sjjjjzhfh@gmail.com',
      pass: 'lhmk aehc ydsq djch'
    }
  ]

  const sendEmail = async ({ user, pass }) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        }
      })

      const mailOptions = {
        from: user,
        to: 'support@support.whatsapp.com',
        subject: 'Возникла проблема с кодом подтверждения WhatsApp. До меня это не доходит. Пожалуйста, помогите мне.',
        text: `Один из хакеров догадался о коде проверки без моих знаний (и это причина, по которой номер был отключен. Пожалуйста, удалите предположение с моего номера телефона, чтобы я мог отправить сообщение или телефонный звонок, чтобы получить код и вернуться в WhatsApp. Спасибо, и это мой номер телефона(${text}).`
      }

      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      return false
    }
  }

  for (const account of accounts) {
    let success = false
    while (!success) {
      success = await sendEmail(account)
      if (!success) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  m.reply('تم إرسال الرسالة من جميع الحسابات بنجاح')
}

handler.help = ['فك-تخمين <رقم>']
handler.tags = ['tools']
handler.command = ['ميلر']
handler.owner = true;
export default handler