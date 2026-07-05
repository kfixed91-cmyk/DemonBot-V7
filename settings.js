const { loadConfig, saveConfig, DEFAULT_CONFIG } = require('./config');

class Settings {
  constructor() {
    this._config = loadConfig();
  }
  
  reload() { this._config = loadConfig(); }
  getAll() { return this._config; }
  
  get(key) { return this._config[key]; }
  set(key, val) { 
    this._config[key] = val; 
    saveConfig(this._config);
  }
  
  reset() {
    this._config = { ...DEFAULT_CONFIG };
    saveConfig(this._config);
  }
}

module.exports = new Settings();
