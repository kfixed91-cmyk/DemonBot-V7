const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const { generateId } = require('../../lib/functions');

module.exports = {
  name: 'ocr',
  aliases: ['read', 'lire'],
  description: 'Li tèks sou foto',
  
  async execute(sock, msg, args, { from }) {
    let media;
    
    if (msg.message.imageMessage) {
      media = msg.message.imageMessage;
    } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      media = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    } else {
      await sock.sendMessage(from, { text: '❌ Reply a yon foto!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '🔍 Ap li tèks la...' });
    
    try {
      const stream = await downloadContentFromMessage(media, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      
      const tempFile = path.join(__dirname, '..', '..', 'data', `${generateId()}.jpg`);
      await fs.outputFile(tempFile, buffer);
      
      const Tesseract = require('tesseract.js');
      const { data } = await Tesseract.recognize(tempFile, 'fra+eng');
      
      await fs.remove(tempFile);
      
      if (data.text.trim()) {
        await sock.sendMessage(from, { text: `📝 Tèks yo:\n\n${data.text}` });
      } else {
        await sock.sendMessage(from, { text: '❌ Pa gen tèks sou foto a' });
      }
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
