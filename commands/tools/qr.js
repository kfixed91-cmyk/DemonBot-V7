const axios = require('axios');

module.exports = {
  name: 'qr',
  aliases: ['qrgen'],
  description: 'Jenere QR kòd',
  
  async execute(sock, msg, args, { from }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete yon tèks!' });
      return;
    }
    
    const text = args.join(' ');
    await sock.sendMessage(from, {
      image: { url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}` },
      caption: `📱 QR kòd: ${text}`
    });
  }
};
