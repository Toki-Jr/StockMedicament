const prisma = require('../config/prisma');

const getAll = async ({ type_alerte, lu } = {}, userRole) => {
  return prisma.alerte.findMany({
    where: {
      AND: [
        {
          OR: [
            { role_cible: userRole.toUpperCase() },
            { role_cible: userRole },
          ],
        },
        ...(type_alerte ? [{ type_alerte }] : []),
        ...(lu !== undefined && lu !== '' ? [{ lu: lu === 'true' }] : []),
      ],
    },
    include: { medicament: { select: { nom: true, code_cip: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getNonLues = async (userRole) => {
  return prisma.alerte.count({
    where: {
      lu: false,
      OR: [
        { role_cible: userRole.toUpperCase() },
        { role_cible: userRole },
      ],
    },
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
    data:  { lu: true },
  });
};

const marquerToutesLues = async (userRole) => {
  return prisma.alerte.updateMany({
    where: {
      AND: [
        { lu: false },
        {
          OR: [
            { role_cible: userRole.toUpperCase() },
            { role_cible: userRole },
            { role_cible: null },
          ],
        },
      ],
    },
    data: { lu: true },
  });
};

const remove = async (id) => {
  return prisma.alerte.delete({ where: { id_alerte: parseInt(id) } });
};


module.exports = { getAll, getById, marquerLu, marquerToutesLues, remove, getNonLues };