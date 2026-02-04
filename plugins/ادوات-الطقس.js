import axios from 'axios';

const handler = async (m, { args }) => {
  
  if (!args[0]) throw 'الرجاء إدخال اسم المدينة أو الدولة.';

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
    const res = await response;
    const name = res.data.name;
    const Country = res.data.sys.country;
    const Weather = res.data.weather[0].description;
    const Temperature = res.data.main.temp + '°C';
    const Minimum_Temperature = res.data.main.temp_min + '°C';
    const Maximum_Temperature = res.data.main.temp_max + '°C';
    const Humidity = res.data.main.humidity + '%';
    const Wind = res.data.wind.speed + 'كم/س';

    const wea = `*تقرير الطقس في ${name}:*
*البلد:* ${Country}
*الوصف:* ${Weather}
*درجة الحرارة:* ${Temperature}
*درجة الحرارة الدنيا:* ${Minimum_Temperature}
*درجة الحرارة القصوى:* ${Maximum_Temperature}
*الرطوبة:* ${Humidity}
*سرعة الرياح:* ${Wind}`;

    m.reply(wea);
  } catch {
    return 'حدث خطأ أثناء استرجاع بيانات الطقس. يرجى التحقق من اسم المدينة أو الدولة.';
  }
};

handler.help = ['clima *<ciudad/país>*'];
handler.tags = ['herramientas'];
handler.command = /^(clima|الطقس)$/i;
export default handler;
