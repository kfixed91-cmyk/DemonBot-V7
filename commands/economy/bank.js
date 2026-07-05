module.exports = {
  name: 'bank',
  aliases: ['balance', 'bal', 'money'],
  description: 'Tcheke balans ou',
  
  async execute(sock, msg, args, { from, sender, db }) {
    const user = db.getBalance(sender);
    const level = db.getLevel(sender);
    
    await sock.sendMessage(from, { text: `🏦 *Bank DemonBot*\n\n💰 Kontan: $${user.money}\n🏧 Bank: $${user.bank}\n📊 Nivo: ${level.level}\n⭐ XP: ${level.xp}/${level.xpNeeded}` });
  }
};
