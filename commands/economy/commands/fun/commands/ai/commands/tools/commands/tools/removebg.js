const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'removebg',
  aliases: ['nobg', 'rmbg'],
  description: 'Retire background foto',
  
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
    
    await sock.sendMessage(from, { text: '🖼️ Ap retire background...' });
    
    try {
      const stream = await downloadContentFromMessage(media, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      
      const form = new FormData();
      form.append('image_file', buffer, { filename: 'image.jpg' });
      
      const { data } = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
        headers: { 'X-Api-Key': 'quickapi-1d9b1e3b3a1e4f3b8c9d7e6f5a4b3c2', ...form.getHeaders() },
        responseType: 'arraybuffer'
      });
      
      await sock.sendMessage(from, { 
        image: data,
        caption: '🖼️ Background retire!'
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
