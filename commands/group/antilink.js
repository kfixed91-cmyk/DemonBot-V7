module.exports = {
  name: 'antilink',
  aliases: ['antilien'],
  groupOnly: true,
  description: 'Jere anti-lyen nan gwoup',
  
  async execute(sock, msg, args, { from, db }) {
    if (!args.length) {
      const group = db.getGroup(from);
      const settings = JSON.parse(group.settings);
      const status = settings.antiLink ? 'Aktive ✅' : 'Deaktive ❌';
      await sock.sendMessage(from, { text: `🔗 Anti-Link: ${status}` });
      return;
    }
    
    const action = args[0].toLowerCase();
    const setTo = action === 'on' || action === 'true' || action === 'activate';
    
    db.setGroupSetting(from, 'antiLink', setTo);
    await sock.sendMessage(from, { text: `✅ Anti-Link ${setTo ? 'aktive' : 'deaktive'}!` });
  }
};
