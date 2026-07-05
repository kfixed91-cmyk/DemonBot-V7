const { ytPlay } = require('../../lib/scraper');
const ytdl = require('ytdl-core');

module.exports = {
  name: 'yt',
  aliases: ['youtube', 'ytdl'],
  description: 'Telechaje videyo YouTube',
  
  async execute(sock, msg, args, { from }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete non chante a!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '🔍 Ap chèche...' });
    
    try {
      const result = await ytPlay(args.join(' '));
      const stream = ytdl(result.url, { quality: 'lowest' });
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      
      await sock.sendMessage(from, {
        video: buffer,
        caption: `🎵 ${result.title}\n⏱ ${result.duration}`
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
