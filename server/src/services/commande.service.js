// ===== SERVICE =====
const prisma = require('../config/prisma');

const getAll = async (statut) => {
  return prisma.commande.findMany({
    where: statut ? { statut } : undefined,
    include: { medicament: { select: { nom: true, code_cip: true, prix_unitaire: true } } },
    orderBy: { date_commande: 'desc' },
  });
};

const getById = async (id) => {
  const cmd = await prisma.commande.findUnique({
    where: { id_commande: parseInt(id) },
    include: { medicament: true },
  });
  if (!cmd) throw { statusCode: 404, message: 'Commande introuvable' };
  return cmd;
};

const create = async ({ date_commande, statut, quantite, id_medoc }) => {
  return prisma.commande.create({
    data: {
      date_commande: date_commande ? new Date(date_commande) : new Date(),
      statut: statut || 'en_attente',
      quantite: parseInt(quantite),
      id_medoc: parseInt(id_medoc),
    },
    include: { medicament: { select: { nom: true } } },
  });
};

const updateStatut = async (id, statut) => {
  const validStatuts = ['en_attente', 'validee', 'annulee', 'livree'];
  if (!validStatuts.includes(statut))
    throw { statusCode: 400, message: `Statut invalide. Valeurs : ${validStatuts.join(', ')}` };

  return prisma.commande.update({
    where: { id_commande: parseInt(id) },
    data: { statut },
  });
};

const remove = async (id) => {
  return prisma.commande.delete({ where: { id_commande: parseInt(id) } });
};

module.exports = { getAll, getById, create, updateStatut, remove };