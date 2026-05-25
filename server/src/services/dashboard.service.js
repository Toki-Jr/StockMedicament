const prisma = require('../config/prisma');

const getStats = async () => {
  const [
    totalMedicaments,
    totalLots,
    totalUsers,
    usersApprouves,
    commandesValidees,
    commandesEnAttente,
    stockTotal,
    mouvementsAujourdhui,
    dernieresCommandes,
    derniersMovements,
    entreesAggregate,
    sortiesAggregate,
  ] = await Promise.all([
    prisma.medicament.count(),
    prisma.lot.count(),
    prisma.user.count(),
    prisma.user.count({ where: { approuve: true } }),
    prisma.commande.count({ where: { statut: 'validee' } }),
    prisma.commande.count({ where: { statut: 'en_attente' } }),
    prisma.lot.aggregate({ _sum: { quantite_entre: true, quantite_sortie: true } }),
    prisma.mouvementstock.count({
      where: {
        date_mvt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.commande.findMany({
      take: 5,
      orderBy: { date_commande: 'desc' },
      include: {
        medicament: { select: { nom: true } },
        user:       { select: { nom: true, prenom: true } },
      },
    }),
    prisma.mouvementstock.findMany({
      take: 5,
      orderBy: { date_mvt: 'desc' },
      include: {
        lot: { include: { medicament: { select: { nom: true } } } },
      },
    }),
    prisma.mouvementstock.aggregate({
      _sum: { quantite_mvt: true },
      where: {
        type_mvt: 'entree',
        date_mvt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.mouvementstock.aggregate({
      _sum: { quantite_mvt: true },
      where: {
        type_mvt: 'sortie',
        date_mvt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  const stockDisponible =
    (stockTotal._sum.quantite_entre ?? 0) -
    (stockTotal._sum.quantite_sortie ?? 0);

  return {
    totalMedicaments,
    totalLots,
    totalUsers,
    usersApprouves,
    commandesValidees,
    commandesEnAttente,
    stockDisponible,
    mouvementsAujourdhui,
    dernieresCommandes,
    derniersMovements,
    entreesAujourdhui: entreesAggregate._sum.quantite_mvt ?? 0,
    sortiesAujourdhui: sortiesAggregate._sum.quantite_mvt ?? 0,
  };
};

const getCommandesParJour = async () => {
  const days = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const gte = new Date(date.setHours(0, 0, 0, 0));
    const lte = new Date(date.setHours(23, 59, 59, 999));

    const commandes = await prisma.commande.groupBy({
      by: ['id_medoc'],
      _sum: { quantite: true },
      where: {
        date_commande: { gte, lte },
        statut: { not: 'brouillon' },
      },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 1,
    });

    let topMedicament = null;
    if (commandes.length > 0) {
      const med = await prisma.medicament.findUnique({
        where: { id_medoc: commandes[0].id_medoc },
        select: { nom: true },
      });
      topMedicament = {
        nom:      med?.nom ?? '—',
        quantite: commandes[0]._sum.quantite ?? 0,
      };
    }

    result.push({
      date:  new Date(gte).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }),
      top:   topMedicament,
    });
  }

  return result;
};

module.exports = { getStats, getCommandesParJour };