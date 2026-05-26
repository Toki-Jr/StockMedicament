const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const { log } = require('./historique.service'); 

async function register(userData) {
  const { nom, prenom, email, password, role } = userData;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email déjà utilisé');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nom, prenom, email, password: hashedPassword, role: role || 'user', approuve: false }
  });

  await log('INSCRIPTION', `Nouvel utilisateur inscrit : ${user.nom} ${user.prenom} (${user.role}) — en attente d'approbation`, user.id);

  // Notif admin
  await prisma.alerte.create({
    data: {
      type_alerte: 'NOUVELLE_INSCRIPTION',
      message:     `${user.nom} ${user.prenom} (${user.role}) s'est inscrit et attend votre approbation.`,
      role_cible:  'ADMIN',
      id_medoc:    1,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function login(userData) {
  const { email, password } = userData;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Identifiants invalides');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Identifiants invalides');

  if (!user.approuve) throw new Error('Votre compte est en attente d\'approbation par l\'administrateur.');

  const token = signToken({ id: user.id, role: user.role });
  await log('CONNEXION', `${user.nom} ${user.prenom} (${user.role}) s'est connecté`, user.id);

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

async function getAllUsers() {
  return await prisma.user.findMany({
    select: { id: true, nom: true, prenom: true, email: true, role: true, approuve: true, createdAt: true }
  });
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
  if (!user) throw { statusCode: 404, message: 'Utilisateur introuvable' };
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function updateUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data,
  });

  await log('USER_MODIFIE', `Utilisateur #${id} modifié`, parseInt(id)); 

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function deleteUser(id, adminId) {
  const userId = parseInt(id);

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return;

  const isSelf = userId === parseInt(adminId);
  if (!isSelf) {
    await log('USER_SUPPRIME', `Utilisateur #${userId} supprimé`, parseInt(adminId));
  }

  await prisma.historique.deleteMany({ where: { id_user: userId } });
  await prisma.commande.deleteMany({  where: { id_user: userId } });
  await prisma.user.delete({          where: { id: userId } });
}

async function approuverUser(id, adminId) {
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data:  { approuve: true },
  });
  await log('USER_APPROUVE', `Utilisateur #${id} (${user.nom} ${user.prenom}) approuvé`, parseInt(adminId));
  return user;
}

module.exports = { register, login, getAllUsers, getUserById, updateUser, deleteUser, approuverUser };