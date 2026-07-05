const axios = require('axios');

module.exports = {
  name: 'weather',
  aliases: ['meteo', 'tan'],
  description: 'Gade tan an',
  
  async execute(sock, msg, args, { from }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete non vil la!' });
      return;
    }
    
    const city = args.join(' ');
    
    try {
      const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=quickapi-1d9b1e3b3a1e4f3b8c9d7e6f5a4b3c2&units=metric&lang=fr`);
      
      await sock.sendMessage(from, { 
        text: `🌤️ *Tan an nan ${data.name}*\n\n🌡️ Tanperati: ${data.main.temp}°C\n💧 Imidite: ${data.main.humidity}%\n🌬️ Van: ${data.wind.speed} m/s\n☁️ Kondisyon: ${data.weather[0].description}`
      });
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ Vil la pa jwenn' });
    }
  }
};
