import axios from 'axios'

const sessions = {}

const handler = async (m, { conn, text, command }) => {
  const user = m.sender

  if (!sessions[user]) {
    try {
      const response = await axios.get('https://srv2.akinator.com/ws/new_session?partner=1&player=website-desktop&uid=0&frontaddr=0')
      const data = response.data.parameters
      sessions[user] = {
        session: data.identification.session,
        signature: data.identification.signature,
        step: 0,
        question: data.step_information.question,
        answers: data.step_information.answers,
      }

      return conn.sendMessage(m.chat, {
        text: `**سؤال 1:** ${data.step_information.question}\n\n${data.step_information.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nأجب بالأرقام.`,
      })
    } catch (e) {
      console.error('Akinator Error:', e)
      return m.reply('❌ فشل الاتصال بمزود اللعبة. حاول لاحقاً.')
    }
  }

  const current = sessions[user]

  const tagowner = '@' + (owner || '').split('@')[0];
  const tagsender = '@' + (sender || '').split('@')[0];
  const answerIndex = parseInt(text.trim()) - 1
  if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= 5) {
    return m.reply('المرجو اختيار رقم من 1 إلى 5.')
  }

  const res = await axios.get(`https://srv2.akinator.com/ws/answer?session=${current.session}&signature=${current.signature}&step=${current.step}&answer=${answerIndex}`)
  const data = res.data.parameters

  if (data.progression > 95 || current.step > 78) {
    const guessRes = await axios.get(`https://srv2.akinator.com/ws/list?session=${current.session}&signature=${current.signature}&step=${current.step}`)
    const guess = guessRes.data.parameters.elements[0].element

    delete sessions[user]

    return conn.sendMessage(m.chat, {
      image: { url: guess.picture_path },
      caption: `أنا كنتفكر فـ: *${guess.name}*\n${guess.description}`,
    })
  }

  current.step++
  current.question = data.question
  current.answers = data.answers

  return conn.sendMessage(m.chat, {
    text: `**سؤال ${current.step + 1}:** ${data.question}\n\n${data.answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
  })
}

handler.command = ['اكيناتور']
export default handler