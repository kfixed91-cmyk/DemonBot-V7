const fs = require('fs-extra');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');

const DEFAULT_CONFIG = {
  botName: "DemonBot V7",
  botNumber: "",
  ownerNumber: ["509XXXXXX"],
  ownerName: "Lucifer",
  prefix: "!",
  multiPrefix: false,
  sessionName: "session",
  sessionPath: path.join(__dirname, 'session'),
  dbType: "sqlite",
  mongoUrl: "",
  openaiKey: "",
  replicateKey: "",
  autoRead: false,
  autoStatus: false,
  online: false,
  antiLink: true,
  antiSpam: true,
  antiDelete: true,
  antiBadWords: true,
  antiBot: true,
  antiNSFW: true,
  antiFake: true,
  warnCount: 3,
  welcome: true,
  goodbye: true,
  welcomeImage: true,
  startMoney: 1000,
  dailyReward: 500,
  workReward: 200,
  levelSystem: true,
  xpPerMessage: 10,
  debug: false
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readJSONSync(CONFIG_PATH);
      return { ...DEFAULT_CONFIG, ...data };
    }
    return { ...DEFAULT_CONFIG };
  } catch (e) {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  fs.ensureDirSync(path.dirname(CONFIG_PATH));
  fs.writeJSONSync(CONFIG_PATH, config, { spaces: 2 });
}

module.exports = { loadConfig, saveConfig, DEFAULT_CONFIG };
