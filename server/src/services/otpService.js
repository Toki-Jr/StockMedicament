const crypto = require('crypto');

// Stockage en mémoire (remplace par Redis ou table DB en prod)
const otpStore = new Map();

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function saveOtp(email, otp) {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
  });
}

function verifyOtp(email, inputOtp) {
  const record = otpStore.get(email);
  if (!record) return { valid: false, reason: 'Code introuvable' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'Code expiré' };
  }
  if (record.otp !== inputOtp) return { valid: false, reason: 'Code incorrect' };
  otpStore.delete(email); // usage unique
  return { valid: true };
}

function checkOtpOnly(email, inputOtp) {
  const record = otpStore.get(email);
  if (!record) return { valid: false, reason: 'Code introuvable' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'Code expiré' };
  }
  if (record.otp !== inputOtp) return { valid: false, reason: 'Code incorrect' };
  return { valid: true }; 
}

module.exports = { generateOtp, saveOtp, verifyOtp, checkOtpOnly };