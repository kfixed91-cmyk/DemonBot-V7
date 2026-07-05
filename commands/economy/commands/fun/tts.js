const gTTS = require('google-tts-api');

module.exports = {
  name: 'tts',
  aliases: ['speak', 'voice'],
  description: 'Tèks an vwa',
  
  async execute(sock, msg, args, { from }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete yon tèks!' });
      return;
    }
    
    const text = args.join(' ');
    const lang = 'fr';
    
    try {
      const url = gTTS.getAudioUrl(text, { lang, slow: false });
      
      await sock.sendMessage(from, { 
        audio: { url },
        mimetype: 'audio/mpeg',
        ptt: true
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
