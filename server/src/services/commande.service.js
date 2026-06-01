const prisma = require('../config/prisma.js');
const { log } = require('./historique.service.js');
const { create: createMouvement } = require('./mouvement.service');

// ── Include réutilisable ──────────────────────────────────────────────────────
const COMMANDE_INCLUDE = {
  lignes: {
    include: {
      medicament: {
        select: { nom: true, code_cip: true, prix_unitaire: true },
      },
    },
  },
  user: {
    select: { nom: true, prenom: true, role: true },
  },
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
const getAll = async (userRole, userId) => {
  return prisma.commande.findMany({
    where: userRole === 'admin' ? {} : { id_user: parseInt(userId) },
    include: COMMANDE_INCLUDE,
    orderBy: { date_commande: 'desc' },
  });
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
  return prisma.commande.findUnique({
    where: { id_commande: parseInt(id) },
    include: COMMANDE_INCLUDE,
  });
};

// ── CREATE (avec lignes) ──────────────────────────────────────────────────────
const create = async (userId, payload) => {
  const { lignes } = payload;

  if (!lignes || lignes.length === 0) {
    throw new Error('La commande doit contenir au moins un médicament.');
  }

  const commande = await prisma.commande.create({
    data: {
      id_user: parseInt(userId),
      statut:  'brouillon',
      lignes: {
        create: lignes.map(l => ({
          id_medoc:  parseInt(l.id_medoc),
          quantite:  parseInt(l.quantite),
        })),
      },
    },
    include: COMMANDE_INCLUDE,
  });

  await log(
    'COMMANDE_CREEE',
    `Commande #${commande.id_commande} créée (${commande.lignes.length} ligne(s))`,
    userId,
  );

  return commande;
};

// ── ENVOYER (brouillon → en_attente) ─────────────────────────────────────────
const envoyer = async (id, userId, userRole) => {
  const commande = await getById(id);

  if (!commande) throw new Error('Commande introuvable.');
  if (userRole !== 'admin' && commande.id_user !== parseInt(userId)) {
    throw new Error('Accès refusé.');
  }
  if (commande.statut !== 'brouillon') {
    throw new Error('Seul un brouillon peut être envoyé.');
  }

  const updated = await prisma.commande.update({
    where:   { id_commande: parseInt(id) },
    data:    { statut: 'en_attente' },
    include: COMMANDE_INCLUDE,
  });

  const alerte = await prisma.alerte.create({
    data: {
      type_alerte: 'NOUVELLE_COMMANDE',
      message: `Nouvelle commande #${id} de ${commande.user.nom} ${commande.user.prenom}`,
      role_cible: 'admin',
    }
  });

  await log(
    'COMMANDE_ENVOYEE',
    `Commande #${id} envoyée à l'admin`,
    userId,
  );

  return updated;
};

// ── VALIDER (en_attente → validee) ───────────────────────────────────────────
const valider = async (id, motif, adminId) => {
  const commande = await getById(id);

  if (!commande) throw new Error('Commande introuvable.');
  if (commande.statut !== 'en_attente') {
    throw new Error('Seule une commande en attente peut être validée.');
  }

  const updated = await prisma.commande.update({
    where:   { id_commande: parseInt(id) },
    data:    { statut: 'validee', motif_rejet: motif || null },
    include: COMMANDE_INCLUDE,
  });

  // ── Créer un mouvement sortie par ligne ──────────────────────────────────
  for (const ligne of commande.lignes) {
    const lot = await prisma.lot.findFirst({
      where: { id_medoc: ligne.id_medoc },
      orderBy: { date_expiration: 'asc' }, // FEFO
    });

    if (!lot) continue;

    await createMouvement({
      type_mvt:     'sortie',
      quantite_mvt: ligne.quantite,
      motif:        `Commande #${id}`,
      id_lot:       lot.id_lot,
    });
  }

  await prisma.alerte.create({
    data: {
      type_alerte: 'COMMANDE_VALIDEE',
      message:     `Votre commande #${id} a été validée.${motif ? ` Motif : ${motif}` : ''}`,
      role_cible:  commande.user.role.toLowerCase(),
      id_user:     commande.id_user,
    },
  });

  await log(
    'COMMANDE_VALIDEE',
    `Commande #${id} validée${motif ? ` — ${motif}` : ''}`,
    adminId ?? commande.id_user,
  );

  return updated;
};

// ── REJETER (en_attente → rejetee) ───────────────────────────────────────────
const rejeter = async (id, motif, adminId) => {
  const commande = await getById(id);

  if (!commande) throw new Error('Commande introuvable.');
  if (commande.statut !== 'en_attente') {
    throw new Error('Seule une commande en attente peut être rejetée.');
  }
  if (!motif?.trim()) throw new Error('Le motif de rejet est obligatoire.');

  const updated = await prisma.commande.update({
    where:   { id_commande: parseInt(id) },
    data:    { statut: 'rejetee', motif_rejet: motif },
    include: COMMANDE_INCLUDE,
  });

  console.log('[rejeter] role_cible:', commande.user?.role, '| user complet:', commande.user);

  await prisma.alerte.create({
    data: {
      type_alerte: 'COMMANDE_REJETEE',
      message:     `Votre commande #${id} a été rejetée. Motif : ${motif}`,
      role_cible:  commande.user.role,
      id_user: commande.id_user,
    },
  });

  await log(
    'COMMANDE_REJETEE',
    `Commande #${id} rejetée — ${motif}`,
    adminId ?? commande.id_user,
  );

  return updated;
};

// ── DELETE brouillon ──────────────────────────────────────────────────────────
const removeBrouillon = async (id, userId, userRole) => {
  const commande = await getById(id);

  if (!commande) throw new Error('Commande introuvable.');
  if (userRole !== 'admin' && commande.id_user !== parseInt(userId)) {
    throw new Error('Accès refusé.');
  }
  if (commande.statut !== 'brouillon') {
    throw new Error('Seul un brouillon peut être supprimé.');
  }

  await prisma.commande.delete({
    where: { id_commande: parseInt(id) },
  });

  await log(
    'COMMANDE_SUPPRIMEE',
    `Brouillon #${id} supprimé`,
    userId,
  );
};

module.exports = { getAll, getById, create, envoyer, valider, rejeter, removeBrouillon };