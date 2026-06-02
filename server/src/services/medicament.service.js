const prisma = require('../config/prisma');
const { log } = require('./historique.service');

const getAll = async (search) => {
  return prisma.medicament.findMany({
    where: search
      ? { 
          OR: [
            { nom: { contains: search, mode: 'insensitive' } }, 
            { code_cip: { contains: search } }
          ] 
        }
      : undefined,
    include: { 
      lots: true, 
      _count: { 
        select: { 
          alertes: true, 
          lignes: true
        } 
      } 
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getById = async (id) => {
  const med = await prisma.medicament.findUnique({
    where: { id_medoc: parseInt(id) },
    include: { lots: true, alertes: { take: 5 }, commandes: { take: 5 } },
  });
  if (!med) { const e = new Error('Médicament introuvable'); e.statusCode = 404; throw e; }
  const stockActuel = med.lots.reduce((acc, lot) => acc + (lot.quantite_entre - lot.quantite_sortie), 0);
  return { ...med, stock_actuel: stockActuel };
};

const create = async (data, userId) => {
  const medicament = await prisma.medicament.create({ data });
  const user       = await prisma.user.findUnique({ where: {id: parseInt(userId)} }); // Recuperer
  await log(
    "Nouvel Médicament",
    `${user.nom} ${user.prenom} a ajouté un nouveau médicament (${medicament.nom})`,
    userId
  );

  return medicament;
};

const update = async (id, data, userId) => {
  const { code_cip, nom, forme, dosage, prix_unitaire, seuil_alerte_qte, seuil_alerte_peremption } = data;
  const medicament = await prisma.medicament.update({
    where: { id_medoc: parseInt(id) },
    data:  { code_cip, nom, forme, dosage, prix_unitaire, seuil_alerte_qte, seuil_alerte_peremption },
  });

  const user       = await prisma.user.findUnique({ where: {id: parseInt(userId)} }); // Recuperer
  await log(
    "Modification de Médicament",
    `${user.nom} ${user.prenom} a modifié un médicament (${medicament.nom})`,
    userId
  );
  return medicament;
};

const remove = async (id) => {
  return prisma.medicament.delete({ where: { id_medoc: parseInt(id) } });
};

const verifierAlertes = async (id_medoc) => {
  const med = await prisma.medicament.findUnique({
    where: { id_medoc: parseInt(id_medoc) },
    include: { lots: true },
  });
  if (!med) return;

  const maintenant = new Date();
  const stockTotal = med.lots.reduce(
    (acc, lot) => acc + (lot.quantite_entre - lot.quantite_sortie), 0
  );

  // 1. Stock faible (Global au médicament)
  if (stockTotal <= med.seuil_alerte_qte) {
    const existante = await prisma.alerte.findFirst({
      where: { id_medoc: med.id_medoc, type_alerte: 'stock_faible', lu: false },
    });
    if (!existante) {
      await prisma.alerte.create({
        data: {
          type_alerte: 'stock_faible',
          message:     `Stock faible pour "${med.nom}" : ${stockTotal} quantités restantes (Seuil critique : ${med.seuil_alerte_qte})`,
          id_medoc: med.id_medoc,
          role_cible: 'admin',
        },
      });
    }
  }

  // 2. Péremption (Spécifique au lot)
  for (const lot of med.lots) {
    const joursRestants = Math.ceil(
      (new Date(lot.date_expiration) - maintenant) / (1000 * 60 * 60 * 24)
    );
    
    // On définit un identifiant unique pour le lot dans le message ou via un champ optionnel
    // Ici, on utilise une vérification incluant le numéro du lot
    const messageExpire = `Lot ${lot.numero_lot} de "${med.nom}" est expiré depuis le ${new Date(lot.date_expiration).toLocaleDateString('fr-FR')}`;
    const messageBientot = `Lot ${lot.numero_lot} de "${med.nom}" expire dans ${joursRestants} jour(s)`;

    // Vérifier si une alerte pour CE lot précis existe déjà
    const existante = await prisma.alerte.findFirst({
      where: { 
        id_medoc: med.id_medoc, 
        OR: [{ message: messageExpire }, { message: messageBientot }],
        lu: false 
      },
    });

    if (!existante && (joursRestants <= 0 || joursRestants <= med.seuil_alerte_peremption)) {
      await prisma.alerte.create({
        data: {
          type_alerte: joursRestants <= 0 ? 'expire' : 'peremption',
          message: joursRestants <= 0 ? messageExpire : messageBientot,
          id_medoc: med.id_medoc,
          role_cible: 'admin',
        },
      });
    }
  }
};

const verifierToutesLesAlertes = async () => {
  // On récupère tous les médicaments
  const medicaments = await prisma.medicament.findMany({
    select: { id_medoc: true }
  });

  // On lance la vérification pour chacun
  const resultats = await Promise.all(
    medicaments.map(m => verifierAlertes(m.id_medoc))
  );
  
  return { message: "Vérification globale terminée", total: medicaments.length };
};

module.exports = { getAll, getById, create, update, remove, verifierAlertes, verifierToutesLesAlertes };
