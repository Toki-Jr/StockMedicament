const prisma = require('../config/prisma');
const NotificationService = require('./notification.service');

const normalizeRole = (role) => role?.toLowerCase();

const roleFilter = (userRole, userId) => ({
  AND: [
    {
      OR: [
        { role_cible: normalizeRole(userRole) },
        { role_cible: null },
      ],
    },
    {
      OR: [
        { id_user: null },
        { id_user: parseInt(userId) },
      ],
    },
  ],
});

const getAll = async ({ type_alerte, lu } = {}, userRole, userId) => {
  return prisma.alerte.findMany({
    where: {
      AND: [
        roleFilter(userRole, userId),
        ...(type_alerte ? [{ type_alerte }] : []),
        ...(lu !== undefined && lu !== '' ? [{ lu: lu === 'true' }] : []),
      ],
    },
    include: { medicament: { select: { nom: true, code_cip: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getNonLues = async (userRole, userId) => {
  return prisma.alerte.count({
    where: {
      lu: false,
      ...roleFilter(userRole, userId),
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

const marquerLu = async (id, userRole, userId) => {
  const alerte = await getById(id);
  if (
    alerte.role_cible !== normalizeRole(userRole) ||
    (alerte.id_user !== null && alerte.id_user !== parseInt(userId))
  ) {
    throw { statusCode: 403, message: 'Accès refusé' };
  }
  return prisma.alerte.update({
    where: { id_alerte: parseInt(id) },
    data:  { lu: true },
  });
};

const marquerToutesLues = async (userRole, userId) => {
  return prisma.alerte.updateMany({
    where: {
      lu: false,
      ...roleFilter(userRole, userId),
    },
    data: { lu: true },
  });
};

const remove = async (id) => {
  return prisma.alerte.delete({ where: { id_alerte: parseInt(id) } });
};

const verifierStockEtCreerAlertes = async () => {
  const maintenant = new Date();

  const lots = await prisma.lot.findMany({
    include: {
      medicament: {
        select: {
          id_medoc: true,
          nom: true,
          seuil_alerte_qte: true,
          seuil_alerte_peremption: true,
        },
      },
    },
  });

  for (const lot of lots) {
    const restant      = (lot.quantite_entre ?? 0) - (lot.quantite_sortie ?? 0);
    const seuilQte     = lot.medicament?.seuil_alerte_qte ?? 0;
    const seuilPerem   = lot.medicament?.seuil_alerte_peremption ?? 30;
    const id_medoc     = lot.medicament?.id_medoc;
    const nomMed       = lot.medicament?.nom ?? '—';
    const joursRestants = lot.date_expiration
      ? Math.ceil((new Date(lot.date_expiration) - maintenant) / (1000 * 60 * 60 * 24))
      : null;

    // ── 1. Stock faible ───────────────────────────────────────────
    if (restant <= seuilQte) {
      const existante = await prisma.alerte.findFirst({
        where: { id_medoc, type_alerte: 'stock_faible', lu: false },
      });

      if (!existante) {
        await prisma.alerte.create({
          data: {
            id_medoc,
            type_alerte: 'stock_faible',
            message:     `Stock faible : ${nomMed} (lot ${lot.numero_lot}) — ${restant} unité(s) restante(s), seuil : ${seuilQte}`,
            lu:          false,
            role_cible:  'admin',
          },
        });
        NotificationService.toRole(
          'admin',
          'stock-faible',
          `Stock faible: ${nomMed}`,
          {
            medicament: nomMed,
            restant
          }
        )
      }
    }

    // ── 2. Lot expiré ─────────────────────────────────────────────
    if (joursRestants !== null && joursRestants <= 0) {
      const existante = await prisma.alerte.findFirst({
        where: { id_medoc, type_alerte: 'expire', lu: false },
      });

      if (!existante) {
        await prisma.alerte.create({
          data: {
            id_medoc,
            type_alerte: 'expire',
            message:     `Lot expiré : ${nomMed} (lot ${lot.numero_lot}) — expiré le ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}`,
            lu:          false,
            role_cible:  'admin',
          },
        });

        NotificationService.toRole(
          'admin',
          'expire',
          `Lot expiré : ${nomMed}`
        );
      }
    }

    // ── 3. Expire bientôt (≤ seuil_alerte_peremption jours) ──────
    if (joursRestants !== null && joursRestants > 0 && joursRestants <= seuilPerem) {
      const existante = await prisma.alerte.findFirst({
        where: { id_medoc, type_alerte: 'expire_bientot', lu: false },
      });

      if (!existante) {
        await prisma.alerte.create({
          data: {
            id_medoc,
            type_alerte: 'expire_bientot',
            message:     `Expiration proche : ${nomMed} (lot ${lot.numero_lot}) — expire dans ${joursRestants} jour(s)`,
            lu:          false,
            role_cible:  'admin',
          },
        });
      }
    }
  }
};

module.exports = { verifierStockEtCreerAlertes, getAll, getById, marquerLu, marquerToutesLues, remove, getNonLues };