const { exec } = require('child_process');

module.exports = {
  name: 'exec',
  aliases: ['$', 'run'],
  ownerOnly: true,
  description: 'Egzekite kòd tèminal',
  
  async execute(sock, msg, args, { from, log }) {
    if (!args.length) {
      await sock.sendMessage(from, { text: '❌ Mete yon kòmand!' });
      return;
    }
    
    const cmd = args.join(' ');
    
    exec(cmd, async (error, stdout, stderr) => {
      let result = '';
      if (stdout) result += stdout;
      if (stderr) result += stderr;
      if (error) result += `\nErè: ${error.message}`;
      
      if (result.length > 4000) {
        await sock.sendMessage(from, { text: result.slice(0, 4000) });
      } else {
        await sock.sendMessage(from, { text: result || 'Pa gen rezilta' });
      }
    });
  }
};
