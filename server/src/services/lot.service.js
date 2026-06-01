const prisma = require('../config/prisma');
const { verifierAlertes } = require('./medicament.service');
const { log }     = require('./historique.service');

const getAll = async (id_medoc) => {
  return prisma.lot.findMany({
    where: id_medoc ? { id_medoc: parseInt(id_medoc) } : undefined,
    include: {
      medicament: { select: { nom: true, code_cip: true } },
      mouvements: { orderBy: { date_mvt: 'desc' }, take: 3 },
    },
    orderBy: { date_expiration: 'asc' },
  });
};

const getById = async (id) => {
  const lot = await prisma.lot.findUnique({
    where: { id_lot: parseInt(id) },
    include: {
      medicament: true,
      mouvements: { orderBy: { date_mvt: 'desc' } },
    },
  });
  if (!lot) {
    const err = new Error('Lot introuvable');
    err.statusCode = 404;
    throw err;
  }
  return { ...lot, stock_restant: lot.quantite_entre - lot.quantite_sortie };
};

const create = async (data, userId) => {
  const lot = await prisma.lot.create({
    data: {
      ...data,
      id_medoc: parseInt(data.id_medoc),
      date_fabrication: new Date(data.date_fabrication),
      date_expiration: new Date(data.date_expiration),
      quantite_entre: parseInt(data.quantite_entre),
      quantite_sortie: parseInt(data.quantite_sortie || 0),
    },
    include: { medicament: { select: { nom: true } } },
  });
  const user = await prisma.user.findUnique({ where: {id: parseInt(userId)} });

  // Vérifier alertes après création d'un lot
  await verifierAlertes(data.id_medoc);
  await log("Nouveau lot", `${user.nom} ${user.prenom} a enttré de medicament dans lot numero: ${lot.numero_lot}`, userId);
  return lot;
};

const update = async (id, data, userId) => {
  const lot =await prisma.lot.update({
    where: { id_lot: parseInt(id) },
    data: {
      ...data,
      ...(data.date_fabrication && { date_fabrication: new Date(data.date_fabrication) }),
      ...(data.date_expiration && { date_expiration: new Date(data.date_expiration) }),
    },
  });
  const user = await prisma.user.findUnique({ where: {id: parseInt(userId)} });

  await log("Modification de lot", `${user.nom} ${user.prenom} a modifié dans le lot numero: ${lot.numero_lot}`, userId);

  return lot;
};

const remove = async (id) => {
  return prisma.lot.delete({ where: { id_lot: parseInt(id) } });
};

// Lots proches péremption (dans les N jours)
const lotsExpirantBientot = async (jours = 30) => {
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() + parseInt(jours));
  return prisma.lot.findMany({
    where: {
      date_expiration: { lte: dateLimite, gte: new Date() },
    },
    include: { medicament: { select: { nom: true, code_cip: true } } },
    orderBy: { date_expiration: 'asc' },
  });
};

module.exports = { getAll, getById, create, update, remove, lotsExpirantBientot };