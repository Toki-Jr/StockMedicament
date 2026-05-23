const prisma = require('../config/prisma');
const { log } = require('./historique.service');

const create = async ({ quantite, id_medoc }, userId) => {

  // await log('COMMANDE_CREEE', `Commande de "${medicament.nom} ", quantité: ${quantite} créée`, userId);

  return prisma.commande.create({
    data: {
      quantite:   parseInt(quantite),
      statut:     'brouillon',
      medicament: { connect: { id_medoc: parseInt(id_medoc) } },
      user:       { connect: { id:       parseInt(userId)   } },
    },
    include: { medicament: { select: { nom: true } } },
  });
};

// brouillon → en_attente  |  notif → ADMIN
const envoyer = async (id, userId) => {
  const commande = await prisma.commande.findUnique({
    where:   { id_commande: parseInt(id) },
    include: {
      medicament: { select: { nom: true, dosage: true } },
      user:       { select: { nom: true, prenom: true, role: true } },
    },
  });

  if (!commande)                             throw { statusCode: 404, message: 'Commande introuvable' };
  if (commande.id_user !== parseInt(userId)) throw { statusCode: 403, message: 'Non autorisé' };
  if (commande.statut  !== 'brouillon')      throw { statusCode: 400, message: 'Commande déjà envoyée' };

  const updated = await prisma.commande.update({
    where: { id_commande: parseInt(id) },
    data:  { statut: 'en_attente' },
  });

  await prisma.alerte.create({
    data: {
      type_alerte: 'NOUVELLE_COMMANDE',
      message:     `${commande.user.nom} ${commande.user.prenom} (${commande.user.role}) a envoyé une commande de "${commande.medicament.nom} ${commande.medicament.dosage} mg", quantite: ${commande.quantite}.`,
      role_cible:  'ADMIN',          // ← notif admin uniquement
      id_medoc:    commande.id_medoc,
    },
  });

  await log('COMMANDE_ENVOYEE', `Commande #${id} envoyée à l'admin`, userId);

  return updated;
};

const removeBrouillon = async (id, userId) => {
  const commande = await prisma.commande.findUnique({
    where: { id_commande: parseInt(id) },
  });

  if (!commande)                             throw { statusCode: 404, message: 'Commande introuvable' };
  if (commande.id_user !== parseInt(userId)) throw { statusCode: 403, message: 'Non autorisé' };
  if (commande.statut  !== 'brouillon')      throw { statusCode: 400, message: 'Seul un brouillon peut être supprimé' };

  return prisma.commande.delete({ where: { id_commande: parseInt(id) } });
};

// en_attente → validee  |  stock décrémenté  |  notif → PHARMACIEN
const valider = async (id, motif = '') => {
  const commande = await prisma.commande.findUnique({
    where:   { id_commande: parseInt(id) },
    include: {
      medicament: { select: { nom: true, dosage: true } },
      user:       { select: { nom: true, prenom: true } },
    },
  });

  if (!commande)                        throw { statusCode: 404, message: 'Commande introuvable' };
  if (commande.statut !== 'en_attente') throw { statusCode: 400, message: 'Commande non en attente' };

  // Récupérer les lots disponibles (FIFO : expiration la plus proche d'abord)
  const lots = await prisma.lot.findMany({
    where:   { id_medoc: commande.id_medoc },
    orderBy: { date_expiration: 'asc' },
  });

  // Calculer le stock total disponible
  const stockTotal = lots.reduce((sum, l) => sum + (l.quantite_entre - l.quantite_sortie), 0);

  if (stockTotal < commande.quantite)
    throw {
      statusCode: 400,
      message: `Stock insuffisant : ${stockTotal} unité(s) disponible(s) pour "${commande.medicament.nom}"`,
    };

  // Répartir la sortie sur les lots (FIFO)
  let reste = commande.quantite;
  const sorties = []; // [{ lot, qte }]

  for (const lot of lots) {
    if (reste <= 0) break;
    const dispo = lot.quantite_entre - lot.quantite_sortie;
    if (dispo <= 0) continue;
    const qte = Math.min(dispo, reste);
    sorties.push({ lot, qte });
    reste -= qte;
  }

  // Transaction : validation + sorties lots + mouvements
  await prisma.$transaction([

    // 1. Passer la commande en validee
    prisma.commande.update({
      where: { id_commande: parseInt(id) },
      data:  { statut: 'validee' },
    }),

    // 2. Mettre à jour quantite_sortie sur chaque lot touché
    ...sorties.map(({ lot, qte }) =>
      prisma.lot.update({
        where: { id_lot: lot.id_lot },
        data:  { quantite_sortie: { increment: qte } },
      })
    ),

    // 3. Créer un mouvementstock par lot touché
    ...sorties.map(({ lot, qte }) =>
      prisma.mouvementstock.create({
        data: {
          type_mvt:     'sortie',
          quantite_mvt: qte,
          motif:        motif || `Commande #${commande.id_commande} validée`,
          id_lot:       lot.id_lot,
        },
      })
    ),

  ]);

  // Notif pharmacien
  await prisma.alerte.create({
    data: {
      type_alerte: 'COMMANDE_VALIDEE',
      message: `Votre commande de "${commande.medicament.nom} ${commande.medicament.dosage} mg", quantite: ${commande.quantite} a été validée.${motif ? ` Motif : ${motif}` : ''}`,
      role_cible:  'PHARMACIEN',
      id_medoc:    commande.id_medoc,
    },
  });

  await log('COMMANDE_VALIDEE', `Commande #${id} validée${motif ? ` — ${motif}` : ''}`, commande.id_user);

  return await prisma.commande.findUnique({
    where:   { id_commande: parseInt(id) },
    include: { medicament: { select: { nom: true } } },
  });
};

// en_attente → rejetee  |  notif → PHARMACIEN
const rejeter = async (id, motif) => {
  if (!motif || motif.trim() === '')
    throw { statusCode: 400, message: 'Le motif de rejet est obligatoire' };

  const commande = await prisma.commande.findUnique({
    where:   { id_commande: parseInt(id) },
    include: {
      medicament: { select: { nom: true, dosage: true } },
      user:       { select: { nom: true, prenom: true } },
    },
  });

  if (!commande)                        throw { statusCode: 404, message: 'Commande introuvable' };
  if (commande.statut !== 'en_attente') throw { statusCode: 400, message: 'Commande non en attente' };

  const updated = await prisma.commande.update({
    where: { id_commande: parseInt(id) },
    data:  { statut: 'rejetee' },
  });

  await prisma.alerte.create({
    data: {
      type_alerte: 'COMMANDE_REJETEE',
      message:     `Votre commande de "${commande.medicament.nom} ${commande.medicament.dosage} mg", quantite: ${commande.quantite} a été rejetée. Motif : ${motif.trim()}`,
      role_cible:  'PHARMACIEN',
      id_medoc:    commande.id_medoc,
    },
  });

  await log('COMMANDE_REJETEE', `Commande #${id} rejetée — ${motif}`, commande.id_user);

  return updated;
};

const getAll = async (userRole, userId) => {
  return prisma.commande.findMany({
    where: userRole === 'admin'
      ? {}
      : { id_user: parseInt(userId) },
    include: {
      medicament: { select: { nom: true, code_cip: true } },
      user:       { select: { nom: true, prenom: true, role: true } },
    },
    orderBy: { date_commande: 'desc' },
  });
};

const getById = async (id) => {
  const commande = await prisma.commande.findUnique({
    where:   { id_commande: parseInt(id) },
    include: {
      medicament: true,
      user:       { select: { nom: true, prenom: true, role: true } },
    },
  });
  if (!commande) throw { statusCode: 404, message: 'Commande introuvable' };
  return commande;
};

module.exports = { create, envoyer, removeBrouillon, valider, rejeter, getAll, getById };