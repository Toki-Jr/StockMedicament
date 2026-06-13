const prisma = require('../config/prisma.js');
const { log } = require('./historique.service.js');
const { createMouvementWithClient } = require('./mouvement.service');
const NotificationService = require('./notification.service.js');
const { getIo } = require('../config/socket.js');

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
    select: { nom: true, prenom: true, role: true, email: true },
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
    `Commande créée (${commande.lignes.length} ligne(s))`,
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
      message: `Nouvelle commande de ${commande.user.nom} ${commande.user.prenom} a été enoyée`,
      role_cible: 'admin',
    }
  });

  await log(
    'COMMANDE_ENVOYEE',
    `Commande #${id} envoyée à l'admin`,
    userId,
  );
  NotificationService.toRole(
    'admin',
    'COMMANDE_ENVOYEE',
    `Nouvelle commande de ${commande.user.nom} ${commande.user.prenom} a été enoyée`
  )
  getIo().to('role:admin').emit('nouvelle_commande', updated);

  return updated;
};

// ── VALIDER (en_attente → validee) ───────────────────────────────────────────
const valider = async (id, motif, adminId) => {
  const commande = await getById(id);

  if (!commande) throw new Error('Commande introuvable.');
  if (commande.statut !== 'en_attente') {
    throw new Error('Seule une commande en attente peut être validée.');
  }

  const result = await prisma.$transaction(async (tx) => {
    for (const ligne of commande.lignes) {
      const lots = await tx.lot.findMany({
        where: { id_medoc: ligne.id_medoc },
        orderBy: { date_expiration: 'asc' },
      });

      const lot = lots.find(l => (l.quantite_entre - l.quantite_sortie) >= ligne.quantite);
      if (!lot) throw new Error(`Stock insuffisant pour le médicament ID: ${ligne.id_medoc}`);

      // ← supprimé : tx.lot.update ici (createMouvementWithClient le fait déjà)

      await createMouvementWithClient({
        type_mvt: 'sortie',
        quantite_mvt: ligne.quantite,
        motif: `Commande #${id}`,
        id_lot: lot.id_lot,
        id_user: commande.id_user,
      }, tx);
    }

    const updated = await tx.commande.update({
      where: { id_commande: parseInt(id) },
      data: { statut: 'validee', motif_rejet: motif || null },
      include: COMMANDE_INCLUDE,
    });

    await tx.alerte.create({
      data: {
        type_alerte: 'COMMANDE_VALIDEE',
        message: `Votre commande a été validée.${motif ? ` Motif : ${motif}` : ''}`,
        role_cible: commande.user.role.toLowerCase(),
        id_user: commande.id_user,
      },
    });

    await log('COMMANDE_VALIDEE', `Commande #${id} validée`, adminId ?? commande.id_user, tx);

    return updated;
  }, {
    timeout: 15000,
  });

  NotificationService.toUser(
    commande.id_user,
    'COMMANDE_VALIDEE',
    `Votre commande a été validée.${motif ? ` Motif : ${motif}` : ''}`
  );

  return result;
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
      message:     `Votre commande a été rejetée. Motif : ${motif}`,
      role_cible:  commande.user.role,
      id_user: commande.id_user,
    },
  });

  await log(
    'COMMANDE_REJETEE',
    `Commande #${id} rejetée — ${motif}`,
    adminId ?? commande.id_user,
  );

  NotificationService.toUser(
    commande.id_user,
    'COMMANDE_VALIDEE',
    `Votre commande a été rejetée. Motif : ${motif}`
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