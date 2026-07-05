const { tiktok } = require('../../lib/scraper');

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'tik'],
  description: 'Telechaje videyo TikTok',
  
  async execute(sock, msg, args, { from }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete URL TikTok la!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '⬇️ Ap telechaje...' });
    
    try {
      const result = await tiktok(args[0]);
      await sock.sendMessage(from, { 
        video: { url: result.play },
        caption: `🎵 ${result.title || ''}\n❤️ ${result.digg_count} likes`
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
