const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');

async function register(userData) {
  const { nom, prenom, email, password, role } = userData;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email déjà utilisé');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { nom, prenom, email, password: hashedPassword, role: role || 'user' }
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

  const token = signToken({ id: user.id, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

async function getAllUsers() {
  return await prisma.user.findMany({
    select: { id: true, nom: true, prenom: true, email: true, role: true }
  });
}

async function updateUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id: parseInt(id) }
  });
}

module.exports = { register, login, getAllUsers, updateUser, deleteUser };