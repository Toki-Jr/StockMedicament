const prisma = require('../config/prisma');

const log = async (action, description, userId) => {
  return prisma.historique.create({
    data: {
      action,
      description,
      user: { connect: { id: parseInt(userId) } },
    },
  });
};

const getAll = async ({ date, action, userId } = {}) => {
  return prisma.historique.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(userId ? { id_user: parseInt(userId) } : {}),
      ...(date ? {
        createdAt: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
      } : {}),
    },
    include: {
      user: { select: { nom: true, prenom: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const remove = async (id) => {
  return prisma.historique.delete({ where: { id_historique: parseInt(id) } });
};

const removeAll = async () => {
  return prisma.historique.deleteMany({});
};

module.exports = { log, getAll, remove, removeAll };