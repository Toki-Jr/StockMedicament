const prisma = require('../config/prisma');
const { verifierAlertes } = require('./medicament.service');

const getAll = async ({ type_mvt, id_lot } = {}, user = {}) => {
  return prisma.mouvementstock.findMany({
    where: {
      ...(type_mvt && { type_mvt }),
      ...(id_lot   && { id_lot: parseInt(id_lot) }),
      ...(user.role && user.role !== 'admin' && { id_user: parseInt(user.id) }),
    },
    include: {
      lot: {
        include: {
          medicaments: {
            include: { medicament: { select: { nom: true, prix_unitaire: true, } } }
          }
        }
      },
      user: true
    },
    orderBy: { date_mvt: 'desc' },
  });
};

const getById = async (id) => {
  const mvt = await prisma.mouvementstock.findUnique({
    where: { id_mvt: parseInt(id) },
    include: {
      lot: {
        include: {
          medicaments: {                              // ← corrigé
            include: { medicament: true }
          }
        }
      }
    },
  });
  if (!mvt) throw { statusCode: 404, message: 'Mouvement introuvable' };
  return mvt;
};

const createMouvementWithClient = async ({ type_mvt, quantite_mvt, motif, id_lot, id_medoc, date_mvt, id_user }, client = prisma) => {
  const qte = parseInt(quantite_mvt);

  const lot = await client.lot.findUnique({
    where: { id_lot: parseInt(id_lot) },
    include: { medicaments: true },                  
  });
  if (!lot) throw { statusCode: 404, message: 'Lot introuvable' };

  if (type_mvt === 'sortie') {
    const stockRestant = lot.medicaments.reduce(
      (sum, m) => sum + (m.quantite_entre - m.quantite_sortie), 0
    );
    if (qte > stockRestant) {
      throw { statusCode: 400, message: `Stock insuffisant. Disponible : ${stockRestant} unités` };
    }
  }

  const mouvement = await client.mouvementstock.create({
    data: {
      type_mvt,
      quantite_mvt: qte,
      motif,
      id_lot:   parseInt(id_lot),
      id_medoc: id_medoc ? parseInt(id_medoc) : null, 
      date_mvt: date_mvt ? new Date(date_mvt) : new Date(),
      ...(id_user && { id_user: parseInt(id_user) }),
    },
  });

  // Mettre à jour la quantité sur chaque lotmedicament du lot
  if (lot.medicaments.length) {
    const lm = lot.medicaments[0];                  
    await client.lotmedicament.update({
      where: { id: lm.id },
      data:
        type_mvt === 'entree'
          ? { quantite_entre:  { increment: qte } }
          : { quantite_sortie: { increment: qte } },
    });
  }

  return mouvement;
};

const create = async (data) => {
  const mouvement = await prisma.$transaction(async (tx) => {
    return await createMouvementWithClient(data, tx);
  });

  // Alertes EN DEHORS de la transaction
  const lot = await prisma.lot.findUnique({
    where: { id_lot: parseInt(data.id_lot) },
    include: { medicaments: true },                  // ← corrigé
  });
  if (lot) {
    for (const m of lot.medicaments) {
      await verifierAlertes(m.id_medoc);             // ← chaque médicament du lot
    }
  }

  return mouvement;
};

const deleteMvt = async (id) => {
  return await prisma.mouvementstock.delete({ where: { id_mvt: parseInt(id) } });
};

const getStats = async () => {
  const [totalEntrees, totalSorties, derniersMvt] = await Promise.all([
    prisma.mouvementstock.aggregate({
      where: { type_mvt: 'entree' },
      _sum: { quantite_mvt: true },
    }),
    prisma.mouvementstock.aggregate({
      where: { type_mvt: 'sortie' },
      _sum: { quantite_mvt: true },
    }),
    prisma.mouvementstock.findMany({
      take: 10,
      orderBy: { date_mvt: 'desc' },
      include: {
        lot: {
          include: {
            medicaments: {                           // ← corrigé
              include: { medicament: { select: { nom: true } } }
            }
          }
        }
      },
    }),
  ]);

  return {
    total_entrees: totalEntrees._sum.quantite_mvt || 0,
    total_sorties: totalSorties._sum.quantite_mvt || 0,
    derniers_mouvements: derniersMvt,
  };
};

module.exports = { getAll, getById, create, getStats, createMouvementWithClient, deleteMvt };