const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../.otp_store.json');

function loadStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8').replace(/^\uFEFF/, ''); // strip BOM
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function saveOtp(key, otp) {
  const store = loadStore();
  store[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
  saveStore(store);
}

function verifyOtp(key, inputOtp) {
  const store = loadStore();
  const record = store[key];
  if (!record) return { valid: false, reason: 'Code introuvable' };
  if (Date.now() > record.expiresAt) {
    delete store[key];
    saveStore(store);
    return { valid: false, reason: 'Code expiré' };
  }
  if (record.otp !== inputOtp) return { valid: false, reason: 'Code incorrect' };
  delete store[key];
  saveStore(store);
  return { valid: true };
}

function checkOtpOnly(key, inputOtp) {
  const sanitizedKey = key.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  const store = loadStore();
  console.log('Store:', store);
  const record = store[sanitizedKey];
  console.log('Record:', record);
  if (!record) return { valid: false, reason: 'Code introuvable' };
  if (Date.now() > record.expiresAt) {
    delete store[sanitizedKey];
    saveStore(store);
    return { valid: false, reason: 'Code expiré' };
  }
  if (record.otp !== inputOtp) return { valid: false, reason: 'Code incorrect' };
  return { valid: true };
}

module.exports = { generateOtp, saveOtp, verifyOtp, checkOtpOnly };