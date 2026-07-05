const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Kreye sticker',
  
  async execute(sock, msg, args, { from }) {
    let media;
    
    if (msg.message.imageMessage) {
      media = msg.message.imageMessage;
    } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      media = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    } else {
      await sock.sendMessage(from, { text: '❌ Reply a yon imaj!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '⌛ Ap kreye sticker...' });
    
    try {
      const stream = await downloadContentFromMessage(media, 'image');
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      
      const sticker = new Sticker(buffer, {
        pack: 'DemonBot V7',
        author: 'Lucifer',
        type: StickerTypes.FULL,
        categories: ['🔥', '⚡'],
        quality: 70
      });
      
      const stickerBuffer = await sticker.toBuffer();
      await sock.sendMessage(from, { sticker: stickerBuffer });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
