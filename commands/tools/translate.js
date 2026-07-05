const translate = require('google-translate-api-x');

module.exports = {
  name: 'translate',
  aliases: ['tr', 'trad'],
  description: 'Tradui tèks nan tout lang',
  
  async execute(sock, msg, args, { from }) {
    if (args.length < 2) {
      await sock.sendMessage(from, { text: '❌ Itilizasyon: !translate [lang] [tèks]\nEgzanp: !translate en Bonjou' });
      return;
    }
    
    const targetLang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');
    
    try {
      const result = await translate(text, { to: targetLang });
      await sock.sendMessage(from, { 
        text: `🌍 *Tradiksyon:*\n\n📝 *Tèks:* ${text}\n🌐 *Lang:* ${result.from.language.iso} → ${targetLang}\n✅ *Rezilta:* ${result.text}` 
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
