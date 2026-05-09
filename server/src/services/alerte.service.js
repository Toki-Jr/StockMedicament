const prisma = require('../config/prisma');

const getAll = async ({ type_alerte, lu } = {}) => {
  return prisma.alerte.findMany({
    where: {
      ...(type_alerte && { type_alerte }),
      ...(lu !== undefined && { lu: lu === 'true' }),
    },
    include: { medicament: { select: { nom: true, code_cip: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const alerte = await prisma.alerte.findUnique({
    where: { id_alerte: parseInt(id) },
    include: { medicament: true },
  });
  if (!alerte) throw { statusCode: 404, message: 'Alerte introuvable' };
  return alerte;
};

const marquerLu = async (id) => {
  return prisma.alerte.update({
    where: { id_alerte: parseInt(id) },
    data: { lu: true },
  });
};

const marquerToutesLues = async () => {
  return prisma.alerte.updateMany({ data: { lu: true } });
};

const remove = async (id) => {
  return prisma.alerte.delete({ where: { id_alerte: parseInt(id) } });
};

const getNonLues = async () => {
  return prisma.alerte.count({ where: { lu: false } });
};

module.exports = { getAll, getById, marquerLu, marquerToutesLues, remove, getNonLues };