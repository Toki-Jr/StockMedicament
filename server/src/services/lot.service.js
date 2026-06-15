const prisma = require('../config/prisma');
const { verifierAlertes } = require('./medicament.service');
const { log } = require('./historique.service');

const getAll = async (id_medoc) => {
  return prisma.lot.findMany({
    where: id_medoc ? {
      medicaments: { some: { id_medoc: parseInt(id_medoc) } }
    } : undefined,
    include: {
      medicaments: {
        include: { medicament: { select: { nom: true, code_cip: true } } },
      },
      mouvements: { orderBy: { date_mvt: 'desc' }, take: 3 },
    },
    orderBy: { date_expiration: 'asc' },
  });
};

const getById = async (id) => {
  const lot = await prisma.lot.findUnique({
    where: { id_lot: parseInt(id) },
    include: {
      medicaments: { include: { medicament: true } },
      mouvements:  { orderBy: { date_mvt: 'desc' } },
    },
  });
  if (!lot) {
    const err = new Error('Lot introuvable');
    err.statusCode = 404;
    throw err;
  }
  const stock_restant = lot.medicaments.reduce(
    (sum, m) => sum + (m.quantite_entre - m.quantite_sortie), 0
  );
  return { ...lot, stock_restant };
};

const create = async (data, userId) => {
  const lot = await prisma.lot.create({
    data: {
      numero_lot:       data.numero_lot,
      date_fabrication: new Date(data.date_fabrication),
      date_expiration:  new Date(data.date_expiration),
    },
  });

  for (const m of data.medicaments) {
    const id_medoc        = parseInt(m.id_medoc);
    const quantite_entre  = parseInt(m.quantite_entre);
    const quantite_sortie = parseInt(m.quantite_sortie || 0);

    // Chercher uniquement dans CE lot, pas dans tous les lots
    const existant = await prisma.lotmedicament.findFirst({
      where: { id_lot: lot.id_lot, id_medoc }
    });

    if (existant) {
      await prisma.lotmedicament.update({
        where: { id: existant.id },
        data: {
          quantite_entre:  { increment: quantite_entre },
          quantite_sortie: { increment: quantite_sortie },
        },
      });
    } else {
      await prisma.lotmedicament.create({
        data: { id_lot: lot.id_lot, id_medoc, quantite_entre, quantite_sortie },
      });
    }

    await verifierAlertes(id_medoc);
  }

  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  await log(
    "Nouveau lot",
    `${user.nom} ${user.prenom} a entré des médicaments dans le lot numéro: ${lot.numero_lot}`,
    userId
  );

  return prisma.lot.findUnique({
    where: { id_lot: lot.id_lot },
    include: { medicaments: { include: { medicament: { select: { nom: true } } } } },
  });
};

const update = async (id, data, userId) => {
  const lot = await prisma.lot.update({
    where: { id_lot: parseInt(id) },
    data: {
      ...(data.numero_lot       && { numero_lot:       data.numero_lot }),
      ...(data.date_fabrication && { date_fabrication: new Date(data.date_fabrication) }),
      ...(data.date_expiration  && { date_expiration:  new Date(data.date_expiration) }),
    },
  });

  if (data.medicaments?.length) {
    for (const m of data.medicaments) {
      await prisma.lotmedicament.upsert({
        where: {
          id_lot_id_medoc: { id_lot: parseInt(id), id_medoc: parseInt(m.id_medoc) },
        },
        update: {
          ...(m.quantite_entre  !== undefined && { quantite_entre:  parseInt(m.quantite_entre) }),
          ...(m.quantite_sortie !== undefined && { quantite_sortie: parseInt(m.quantite_sortie) }),
        },
        create: {
          id_lot:          parseInt(id),   // ← manquait
          id_medoc:        parseInt(m.id_medoc),
          quantite_entre:  parseInt(m.quantite_entre),
          quantite_sortie: parseInt(m.quantite_sortie || 0),
        },
      });
    }
  }

  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  await log(
    "Modification de lot",
    `${user.nom} ${user.prenom} a modifié le lot numéro: ${lot.numero_lot}`,
    userId
  );

  return prisma.lot.findUnique({
    where: { id_lot: parseInt(id) },
    include: { medicaments: { include: { medicament: { select: { nom: true } } } } },
  });
};

const remove = async (id) => {
  await prisma.lotmedicament.deleteMany({ where: { id_lot: parseInt(id) } });
  return prisma.lot.delete({ where: { id_lot: parseInt(id) } });
};

const lotsExpirantBientot = async (jours = 30) => {
  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() + parseInt(jours));
  return prisma.lot.findMany({
    where: { date_expiration: { lte: dateLimite, gte: new Date() } },
    include: {
      medicaments: {  // ← corrigé
        include: { medicament: { select: { nom: true, code_cip: true } } },
      },
    },
    orderBy: { date_expiration: 'asc' },
  });
};

module.exports = { getAll, getById, create, update, remove, lotsExpirantBientot };