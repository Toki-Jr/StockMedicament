const prisma = require('../config/prisma');

const getStats = async () => {
  const today = {
    gte: new Date(new Date().setHours(0, 0, 0, 0)),
    lte: new Date(new Date().setHours(23, 59, 59, 999)),
  };

  const [
    totalMedicaments,
    totalLots,
    totalUsers,
    usersApprouves,
    commandesValidees,
    commandesEnAttente,
    stockTotal,          // ✅ depuis lotmedicament
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

    // ✅ quantite_entre / quantite_sortie sont dans lotmedicament
    prisma.lotmedicament.aggregate({
      _sum: { quantite_entre: true, quantite_sortie: true },
    }),

    prisma.mouvementstock.count({ where: { date_mvt: today } }),

    prisma.commande.findMany({
      take: 5,
      orderBy: { date_commande: 'desc' },
      include: {
        lignes: {
          include: {
            medicament: { select: { nom: true } },
          },
        },
        user: { select: { nom: true, prenom: true } },
      },
    }),

    // ✅ lot → medicaments (lotmedicament) → medicament
    prisma.mouvementstock.findMany({
      take: 5,
      orderBy: { date_mvt: 'desc' },
      include: {
        lot: {
          include: {
            medicaments: {
              include: {
                medicament: { select: { nom: true } },
              },
            },
          },
        },
      },
    }),

    prisma.mouvementstock.aggregate({
      _sum: { quantite_mvt: true },
      where: { type_mvt: 'entree', date_mvt: today },
    }),
    prisma.mouvementstock.aggregate({
      _sum: { quantite_mvt: true },
      where: { type_mvt: 'sortie', date_mvt: today },
    }),
  ]);

  const stockDisponible =
    (stockTotal._sum.quantite_entre  ?? 0) -
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
    // ✅ aplatir le nom du 1er médicament du lot pour l'affichage
    derniersMovements: derniersMovements.map(mv => ({
      ...mv,
      nomMedicament: mv.lot?.medicaments?.[0]?.medicament?.nom ?? '—',
    })),
    entreesAujourdhui: entreesAggregate._sum.quantite_mvt ?? 0,
    sortiesAujourdhui: sortiesAggregate._sum.quantite_mvt ?? 0,
  };
};

const getStatsUser = async (userId) => {
  const [
    commandesEnAttente,
    commandesValidees,
    commandesRejetees,
    totalCommandes,
    dernieresCommandes,
  ] = await Promise.all([
    prisma.commande.count({ where: { id_user: userId, statut: 'en_attente' } }),
    prisma.commande.count({ where: { id_user: userId, statut: 'validee' } }),
    prisma.commande.count({ where: { id_user: userId, statut: 'rejetee' } }),
    prisma.commande.count({ where: { id_user: userId } }),
    prisma.commande.findMany({
      where:   { id_user: userId },
      take:    5,
      orderBy: { date_commande: 'desc' },
      include: {
        lignes: {
          include: {
            medicament: { select: { nom: true } },
          },
        },
        user: { select: { nom: true, prenom: true } },
      },
    }),
  ]);

  return {
    commandesEnAttente,
    commandesValidees,
    commandesRejetees,
    totalCommandes,
    dernieresCommandes,
    derniersMovements: [],
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

    const lignes = await prisma.lignecommande.groupBy({
      by:    ['id_medoc'],
      _sum:  { quantite: true },
      where: {
        commande: {
          date_commande: { gte, lte },
          statut: { not: 'brouillon' },
        },
      },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 1,
    });

    let topMedicament = null;
    if (lignes.length > 0) {
      const med = await prisma.medicament.findUnique({
        where:  { id_medoc: lignes[0].id_medoc },
        select: { nom: true },
      });
      topMedicament = {
        nom:      med?.nom ?? '—',
        quantite: lignes[0]._sum.quantite ?? 0,
      };
    }

    result.push({
      date: new Date(gte).toLocaleDateString('fr-FR', {
        weekday: 'short', day: '2-digit', month: 'short',
      }),
      top: topMedicament,
    });
  }

  return result;
};

module.exports = { getStats, getStatsUser, getCommandesParJour };