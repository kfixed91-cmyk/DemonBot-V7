const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment-timezone');

function generateId(length = 10) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

async function downloadImage(url, dest) {
  const response = await axios({ url, responseType: 'arraybuffer' });
  await fs.outputFile(dest, response.data);
  return dest;
}

function getTime(timezone = 'America/New_York') {
  return moment().tz(timezone).format('HH:mm:ss');
}

function getDate(timezone = 'America/New_York') {
  return moment().tz(timezone).format('YYYY-MM-DD');
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function isOwner(jid, owners) {
  const num = jid.replace(/[^0-9]/g, '');
  return owners.some(o => o.replace(/[^0-9]/g, '') === num);
}

function isAdmin(participants, jid) {
  const participant = participants.find(p => p.id === jid);
  return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExtension(mime) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'application/pdf': 'pdf'
  };
  return map[mime] || 'bin';
}

function parseJid(jid) {
  return jid.replace(/:[0-9]+/, '');
}

module.exports = {
  generateId,
  downloadImage,
  getTime,
  getDate,
  formatMoney,
  isOwner,
  isAdmin,
  sleep,
  getExtension,
  parseJid
};
