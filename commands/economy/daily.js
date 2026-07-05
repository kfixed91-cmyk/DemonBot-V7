module.exports = {
  name: 'daily',
  aliases: ['dailyreward'],
  description: 'Jwenn rekonpans chak jou',
  
  async execute(sock, msg, args, { from, sender, db, settings }) {
    const user = db.getBalance(sender);
    const now = new Date();
    const lastDaily = user.daily ? new Date(user.daily) : null;
    
    if (lastDaily && (now - lastDaily) < 86400000) {
      const timeLeft = 86400000 - (now - lastDaily);
      const hours = Math.floor(timeLeft / 3600000);
      const mins = Math.floor((timeLeft % 3600000) / 60000);
      await sock.sendMessage(from, { text: `⏳ Ret tann ${hours} èdtan ${mins} minit!` });
      return;
    }
    
    const reward = settings.get('dailyReward');
    db.addMoney(sender, reward);
    
    await sock.sendMessage(from, { text: `🎉 Ou jwenn $${reward}!` });
  }
};
