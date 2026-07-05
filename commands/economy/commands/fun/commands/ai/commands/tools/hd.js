const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'hd',
  aliases: ['enhance', 'upscale'],
  description: 'Amelyore kalite imaj',
  
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
    
    await sock.sendMessage(from, { text: '✨ Ap amelyore imaj la...' });
    
    try {
      const stream = await downloadContentFromMessage(media, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      
      const form = new FormData();
      form.append('image', buffer, { filename: 'image.jpg' });
      
      const { data } = await axios.post('https://api.deepai.org/api/waifu2x', form, {
        headers: { 'api-key': 'quickapi-1d9b1e3b3a1e4f3b8c9d7e6f5a4b3c2', ...form.getHeaders() }
      });
      
      if (data.output_url) {
        await sock.sendMessage(from, { 
          image: { url: data.output_url },
          caption: '✨ Imaj amelyore!'
        });
      } else {
        await sock.sendMessage(from, { text: '❌ Pa ka amelyore' });
      }
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
