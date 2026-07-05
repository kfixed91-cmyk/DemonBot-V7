module.exports = {
  name: 'tagall',
  aliases: ['everyone', 'all'],
  groupOnly: true,
  description: 'Mansyone tout moun nan gwoup',
  
  async execute(sock, msg, args, { from }) {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    const mentions = participants.map(p => p.id);
    let text = args.length ? args.join(' ') : '@everyone';
    
    await sock.sendMessage(from, { text, mentions });
  }
};
