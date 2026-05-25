// services/updatePreferences.service.js
const prisma  = require('../config/prisma');

async function updatePreferencesService({ userId, fontSize }) {
  if (fontSize < 12 || fontSize > 20) {
    const err = new Error('Taille de police invalide (12–20px).');
    err.status = 400;
    throw err;
  }

  return await prisma.user.update({
    where: { id: userId },
    data:  { fontSize },
    select: { fontSize: true },
  });
}

module.exports = { updatePreferencesService };