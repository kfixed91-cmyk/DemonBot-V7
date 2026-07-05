module.exports = {
  name: 'kick',
  aliases: ['remove'],
  groupOnly: true,
  description: 'Retire yon moun nan gwoup',
  
  async execute(sock, msg, args, { from }) {
    const user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const senderUser = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const isSenderAdmin = groupMetadata.participants.find(p => p.id === senderUser)?.admin;
    const isBotAdmin = groupMetadata.participants.find(p => p.id === sock.user.id)?.admin;
    
    if (!user) {
      await sock.sendMessage(from, { text: '❌ Tag moun nan!' });
      return;
    }
    
    if (!isSenderAdmin) {
      await sock.sendMessage(from, { text: '❌ Ou pa admin gwoup la!' });
      return;
    }
    
    if (!isBotAdmin) {
      await sock.sendMessage(from, { text: '❌ Bot la pa admin gwoup la!' });
      return;
    }
    
    await sock.groupParticipantsUpdate(from, [user], 'remove');
    await sock.sendMessage(from, { text: `✅ Moun nan retire!` });
  }
};
