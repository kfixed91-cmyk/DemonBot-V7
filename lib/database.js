const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs-extra');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.db');

class DB {
  constructor() {
    fs.ensureDirSync(path.dirname(DB_PATH));
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.init();
  }

  init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS economy (
      jid TEXT PRIMARY KEY,
      name TEXT,
      money INTEGER DEFAULT 0,
      bank INTEGER DEFAULT 0,
      daily TEXT,
      work TEXT
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS levels (
      jid TEXT PRIMARY KEY,
      name TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      xpNeeded INTEGER DEFAULT 100
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS groups (
      jid TEXT PRIMARY KEY,
      name TEXT,
      settings TEXT DEFAULT '{}',
      welcome TEXT DEFAULT 'true',
      antiLink TEXT DEFAULT 'true',
      warnCount INTEGER DEFAULT 3,
      createdAt TEXT
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS users (
      jid TEXT PRIMARY KEY,
      name TEXT,
      ban INTEGER DEFAULT 0,
      warn INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      registered TEXT
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT,
      key TEXT,
      value TEXT,
      UNIQUE(jid, key)
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS plugins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      enabled INTEGER DEFAULT 1,
      source TEXT,
      installed TEXT
    )`);
  }

  getBalance(jid) {
    const row = this.db.prepare('SELECT * FROM economy WHERE jid = ?').get(jid);
    if (!row) {
      this.db.prepare('INSERT INTO economy (jid, money, bank) VALUES (?, 0, 0)').run(jid);
      return { money: 0, bank: 0 };
    }
    return row;
  }

  addMoney(jid, amount) {
    this.db.prepare('UPDATE economy SET money = money + ? WHERE jid = ?').run(amount, jid);
    if (this.db.prepare('SELECT changes()').get()['changes()'] === 0) {
      this.db.prepare('INSERT INTO economy (jid, money) VALUES (?, ?)').run(jid, amount);
    }
  }

  removeMoney(jid, amount) {
    this.db.prepare('UPDATE economy SET money = money - ? WHERE jid = ? AND money >= ?').run(amount, jid, amount);
  }

  addBank(jid, amount) {
    this.db.prepare('UPDATE economy SET bank = bank + ? WHERE jid = ?').run(amount, jid);
  }

  getLeaderboard() {
    return this.db.prepare('SELECT * FROM economy ORDER BY money DESC LIMIT 10').all();
  }

  getLevel(jid) {
    let row = this.db.prepare('SELECT * FROM levels WHERE jid = ?').get(jid);
    if (!row) {
      this.db.prepare('INSERT INTO levels (jid, xp, level, xpNeeded) VALUES (?, 0, 1, 100)').run(jid);
      row = { jid, xp: 0, level: 1, xpNeeded: 100 };
    }
    return row;
  }

  addXP(jid, amount = 10) {
    const row = this.getLevel(jid);
    const newXp = row.xp + amount;
    
    if (newXp >= row.xpNeeded) {
      const newLevel = row.level + 1;
      const newNeeded = row.xpNeeded + 50 * newLevel;
      this.db.prepare('UPDATE levels SET xp = 0, level = ?, xpNeeded = ? WHERE jid = ?').run(newLevel, newNeeded, jid);
      return { leveledUp: true, level: newLevel };
    } else {
      this.db.prepare('UPDATE levels SET xp = ? WHERE jid = ?').run(newXp, jid);
      return { leveledUp: false, xp: newXp, xpNeeded: row.xpNeeded };
    }
  }

  getUser(jid) {
    let user = this.db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
    if (!user) {
      this.db.prepare('INSERT INTO users (jid, role) VALUES (?, "user")').run(jid);
      user = { jid, name: '', ban: 0, warn: 0, role: 'user', registered: new Date().toISOString() };
    }
    return user;
  }

  banUser(jid) {
    this.db.prepare('UPDATE users SET ban = 1 WHERE jid = ?').run(jid);
  }

  unbanUser(jid) {
    this.db.prepare('UPDATE users SET ban = 0 WHERE jid = ?').run(jid);
  }

  warnUser(jid) {
    this.db.prepare('UPDATE users SET warn = warn + 1 WHERE jid = ?').run(jid);
  }

  resetWarn(jid) {
    this.db.prepare('UPDATE users SET warn = 0 WHERE jid = ?').run(jid);
  }

  getGroup(jid) {
    let group = this.db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid);
    if (!group) {
      this.db.prepare('INSERT INTO groups (jid, settings, createdAt) VALUES (?, "{}", ?)').run(jid, new Date().toISOString());
      group = { jid, name: '', settings: '{}', welcome: 'true', antiLink: 'true', warnCount: 3 };
    }
    return group;
  }

  setGroupSetting(jid, key, value) {
    const group = this.getGroup(jid);
    const settings = JSON.parse(group.settings);
    settings[key] = value;
    this.db.prepare('UPDATE groups SET settings = ? WHERE jid = ?').run(JSON.stringify(settings), jid);
  }

  setNote(jid, key, value) {
    this.db.prepare('INSERT OR REPLACE INTO notes (jid, key, value) VALUES (?, ?, ?)').run(jid, key, value);
  }

  getNote(jid, key) {
    const row = this.db.prepare('SELECT * FROM notes WHERE jid = ? AND key = ?').get(jid, key);
    return row ? row.value : null;
  }

  delNote(jid, key) {
    this.db.prepare('DELETE FROM notes WHERE jid = ? AND key = ?').run(jid, key);
  }
}

module.exports = new DB();
