// services/auth/changePassword.service.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function changePasswordService({ userId, currentPassword, newPassword }) {

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('Utilisateur introuvable.');
    err.status = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error('Mot de passe actuel incorrect.');
    err.status = 401;
    throw err;
  }

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    const err = new Error("Le nouveau mot de passe doit être différent de l'ancien.");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data:  { password: hashed },
  });
};

module.exports = { changePasswordService };