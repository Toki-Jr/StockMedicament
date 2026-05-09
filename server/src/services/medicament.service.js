const prisma = require('../config/prisma');

const getAll = async (search) => {
  return prisma.medicament.findMany({
    where: search
      ? { OR: [{ nom: { contains: search, mode: 'insensitive' } }, { code_cip: { contains: search } }] }
      : undefined,
    include: {
      lots: true,
      _count: { select: { alertes: true, commandes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const med = await prisma.medicament.findUnique({
    where: { id_medoc: parseInt(id) },
    include: {
      lots: true,
      alertes: { orderBy: { createdAt: 'desc' }, take: 5 },
      commandes: { orderBy: { date_commande: 'desc' }, take: 5 },
    },
  });
  if (!med) throw { statusCode: 404, message: 'Médicament introuvable' };

  // Calcul stock actuel depuis les lots
  const stockActuel = med.lots.reduce((acc, lot) => acc + (lot.quantite_entre - lot.quantite_sortie), 0);
  return { ...med, stock_actuel: stockActuel };
};

const create = async (data) => {
  return prisma.medicament.create({ data });
};

const update = async (id, data) => {
  return prisma.medicament.update({ where: { id_medoc: parseInt(id) }, data });
};

const remove = async (id) => {
  return prisma.medicament.delete({ where: { id_medoc: parseInt(id) } });
};

// Vérification des alertes stock et péremption (appelable après chaque mouvement)
const verifierAlertes = async (id_medoc) => {
  const med = await prisma.medicament.findUnique({
    where: { id_medoc: parseInt(id_medoc) },
    include: { lots: true },
  });
  if (!med) return;

  const alertes = [];
  const maintenant = new Date();
  const seuilJours = med.seuil_alerte_peremption;

  // Alerte stock faible
  const stockTotal = med.lots.reduce((acc, lot) => acc + (lot.quantite_entre - lot.quantite_sortie), 0);
  if (stockTotal <= med.seuil_alerte_qte) {
    alertes.push({
      type_alerte: 'stock_faible',
      message: `Stock de "${med.nom}" (${stockTotal} unités) en dessous du seuil (${med.seuil_alerte_qte})`,
      id_medoc: med.id_medoc,
    });
  }

  // Alerte péremption imminente
  for (const lot of med.lots) {
    const joursRestants = Math.ceil((new Date(lot.date_expiration) - maintenant) / (1000 * 60 * 60 * 24));
    if (joursRestants <= seuilJours && joursRestants > 0) {
      alertes.push({
        type_alerte: 'peremption',
        message: `Lot ${lot.numero_lot} de "${med.nom}" expire dans ${joursRestants} jour(s)`,
        id_medoc: med.id_medoc,
      });
    }
  }

  if (alertes.length > 0) {
    await prisma.alerte.createMany({ data: alertes, skipDuplicates: false });
  }
  return alertes;
};

module.exports = { getAll, getById, create, update, remove, verifierAlertes };