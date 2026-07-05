const axios = require('axios');

module.exports = {
  name: 'imagine',
  aliases: ['generate', 'aiimg', 'img'],
  description: 'Kreye imaj ak AI',
  
  async execute(sock, msg, args, { from, settings }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Dekri imaj ou vle a!' });
      return;
    }
    
    const prompt = args.join(' ');
    const apiKey = settings.get('replicateKey');
    
    if (!apiKey) {
      await sock.sendMessage(from, { text: '❌ Replicate API key pa mete! Itilize: !set replicateKey VOTRE_CLE' });
      return;
    }
    
    await sock.sendMessage(from, { text: '🎨 Ap kreye imaj la...' });
    
    try {
      const { data } = await axios.post('https://api.replicate.com/v1/predictions', {
        version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: { prompt }
      }, {
        headers: { Authorization: `Token ${apiKey}` }
      });
      
      const predictionId = data.id;
      
      let result;
      do {
        await new Promise(r => setTimeout(r, 2000));
        const { data: check } = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: { Authorization: `Token ${apiKey}` }
        });
        result = check;
      } while (result.status !== 'succeeded' && result.status !== 'failed');
      
      if (result.status === 'succeeded') {
        await sock.sendMessage(from, { 
          image: { url: result.output[0] },
          caption: `🎨 ${prompt}`
        });
      } else {
        await sock.sendMessage(from, { text: '❌ AI pa t kapab kreye imaj la' });
      }
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erè: ${e.message}` });
    }
  }
};
