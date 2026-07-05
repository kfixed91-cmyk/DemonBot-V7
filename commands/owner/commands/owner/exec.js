module.exports = {
  name: 'ban',
  aliases: ['banuser'],
  ownerOnly: true,
  description: 'Banni yon itilizatè',
  
  async execute(sock, msg, args, { from, db }) {
    const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    
    if (!user) {
      await sock.sendMessage(from, { text: '❌ Tag moun nan!' });
      return;
    }
    
    db.banUser(user);
    await sock.sendMessage(from, { text: `⛔ Itilizatè a banni!` });
  }
};
