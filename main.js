const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const chalk = require('chalk');
const figlet = require('figlet');
const gradient = require('gradient-string');
const fs = require('fs-extra');
const path = require('path');
const settings = require('./settings');
const log = require('./lib/logger');

console.log(gradient.pastel.multiline(figlet.textSync('DemonBot V7', { horizontalLayout: 'full' })));
console.log(chalk.cyan('=== NEXT-GEN WhatsApp Multi-Device Bot ===\n'));

let sock;
let commands = new Map();
let aliases = new Map();

async function loadCommands() {
  const cmdDir = path.join(__dirname, 'commands');
  const categories = fs.readdirSync(cmdDir);
  
  for (const cat of categories) {
    const catPath = path.join(cmdDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const cmd = require(path.join(catPath, file));
        if (cmd.name) {
          commands.set(cmd.name, cmd);
          if (cmd.aliases) {
            cmd.aliases.forEach(a => aliases.set(a, cmd.name));
          }
          log.success(`Chaje kòmand: ${cmd.name}`);
        }
      } catch (e) {
        log.error(`Erè nan ${file}: ${e.message}`);
      }
    }
  }
  log.info(`Total: ${commands.size} kòmand chaje`);
}

function getCommand(name) {
  return commands.get(name) || commands.get(aliases.get(name));
}

function isOwner(jid, owners) {
  const num = jid.replace(/[^0-9]/g, '');
  return owners.some(o => o.replace(/[^0-9]/g, '') === num);
}

async function handleMessage(msg) {
  try {
    const { key, message } = msg;
    const from = key.remoteJid;
    const sender = key.participant || key.remoteJid;
    const text = message.conversation || message.extendedTextMessage?.text || '';
    
    const prefix = settings.get('prefix');
    if (!text.startsWith(prefix)) return;
    
    const args = text.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = getCommand(cmdName);
    
    if (!cmd) return;
    
    const db = require('./lib/database');
    const user = db.getUser(sender);
    if (user.ban === 1 && !cmd.ownerOnly) {
      await sock.sendMessage(from, { text: '⛔ Ou banni! Ou pa ka itilize bot la.' });
      return;
    }
    
    if (cmd.ownerOnly) {
      const owners = settings.get('ownerNumber');
      if (!isOwner(sender, owners)) {
        await sock.sendMessage(from, { text: '❌ Kòmand sa a se pou owner sèlman!' });
        return;
      }
    }
    
    if (cmd.groupOnly && !from.endsWith('@g.us')) {
      await sock.sendMessage(from, { text: '❌ Kòmand sa a sèlman nan gwoup!' });
      return;
    }
    
    if (settings.get('levelSystem')) {
      const levelResult = db.addXP(sender, settings.get('xpPerMessage'));
      if (levelResult.leveledUp) {
        await sock.sendMessage(from, { text: `🎉 Felisitasyon! Ou monte nan nivo ${levelResult.level}!` });
      }
    }
    
    await cmd.execute(sock, msg, args, {
      from, sender, text, prefix,
      db, settings, log, commands, aliases
    });
    
  } catch (e) {
    log.error(`Erè nan mesaj: ${e.message}`);
  }
}

async function sendWelcome(update) {
  const { id, participants } = update;
  for (const jid of participants) {
    const name = sock.getName(jid) || 'Moun';
    const image = settings.get('welcomeImage') 
      ? { image: fs.readFileSync('./assets/welcome.jpg'), caption: `🎉 Byenveni ${name}!` }
      : { text: `🎉 Byenveni ${name}!` };
    await sock.sendMessage(id, image);
  }
}

async function sendGoodbye(update) {
  const { id, participants } = update;
  for (const jid of participants) {
    const name = sock.getName(jid) || 'Moun';
    await sock.sendMessage(id, { text: `👋 Orevwa ${name}!` });
  }
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(settings.get('sessionPath'));
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['DemonBot V7', 'Safari', '7.0'],
    markOnlineOnConnect: settings.get('online')
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'open') {
      log.success('✅ DemonBot V7 konekte ak WhatsApp!');
      log.info(`📱 Nimewo: ${sock.user.id.split(':')[0]}`);
      settings.set('botNumber', sock.user.id.split(':')[0]);
    }
    
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      log.error(`❌ Dekonekte: ${reason}`);
      
      if (reason === DisconnectReason.loggedOut) {
        log.warn('Sesyon an ekspire! Rekonekte...');
        await fs.remove(settings.get('sessionPath'));
        connect();
      } else {
        log.info('Rekonekte nan 5 segond...');
        setTimeout(connect, 5000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe && msg.message) {
        await handleMessage(msg);
      }
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    if (settings.get('welcome') && update.action === 'add') {
      await sendWelcome(update);
    }
    if (settings.get('goodbye') && update.action === 'remove') {
      await sendGoodbye(update);
    }
  });

  return sock;
}

async function start() {
  log.info('DemonBot V7 ap chaje...');
  await loadCommands();
  await connect();
}

start().catch(e => {
  log.error(`Fatal: ${e.message}`);
  process.exit(1);
});

module.exports = { getCommand, commands, sock };
