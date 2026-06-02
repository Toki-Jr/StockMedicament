const path = require("path");
const { genererFacture }         = require("../services/facture.service");
const { envoyerFactureParEmail } = require("../services/email.service");

// ─────────────────────────────────────────────────────────────────────────────
// Logique partagée : génère le PDF + envoie l'email selon type_mvt
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Décide si une facture doit être générée selon le type de mouvement.
 *  - 'sortie' → vente client → facture obligatoire
 *  - 'entree' → réapprovisionnement → pas de facture client
 */
function estFacturable(type_mvt) {
  return type_mvt === "sortie";
}

/**
 * Cœur de la facturation : génère PDF + envoie email.
 * Utilisé à la fois par facturer() (route dédiée) et
 * facturerDepuisMouvement() (appelé depuis mouvement.controller).
 */
async function _execFacturer({ nomClient, emailClient, nomPharmacien, typeMvt, motif, medicaments }) {
  // 1. Génération PDF
  const { filePath, fileName, numeroFacture, totalGeneral } = await genererFacture({
    nomClient, emailClient, nomPharmacien, typeMvt, motif, medicaments,
  });

  // 2. Envoi email automatique (non bloquant si échec)
  let emailStatut = "non_envoye";
  let emailErreur = null;

  if (emailClient) {
    try {
      await envoyerFactureParEmail({
        emailClient, nomClient, nomPharmacien,
        numeroFacture, totalGeneral, pdfPath: filePath,
      });
      emailStatut = "envoye";
    } catch (err) {
      emailStatut = "echec";
      emailErreur = err.message;
      console.error("[FactureController] Échec email :", err.message);
    }
  }

  return {
    numeroFacture,
    totalGeneral,
    fileName,
    downloadUrl: `/api/factures/telecharger/${fileName}`,
    email: { statut: emailStatut, erreur: emailErreur, destinataire: emailClient || null },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/factures/facturer
// Route directe (appel manuel depuis le front)
// Body: { nomClient, emailClient, nomPharmacien, medicaments, type_mvt, motif }
// ─────────────────────────────────────────────────────────────────────────────
async function facturer(req, res) {
  try {
    const { nomClient, emailClient, nomPharmacien, medicaments, type_mvt, motif } = req.body;

    // Validation de base
    if (!nomClient || !nomPharmacien || !Array.isArray(medicaments) || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Champs requis : nomClient, nomPharmacien, medicaments, type_mvt.",
      });
    }

    if (!type_mvt || !["entree", "sortie"].includes(type_mvt)) {
      return res.status(400).json({
        success: false,
        message: "type_mvt doit être 'entree' ou 'sortie'.",
      });
    }

    // Seule une SORTIE génère une facture client
    if (!estFacturable(type_mvt)) {
      return res.status(200).json({
        success: true,
        factureGeneree: false,
        message: "type_mvt='entree' : aucune facture client générée (réapprovisionnement).",
      });
    }

    if (emailClient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClient)) {
      return res.status(400).json({ success: false, message: "Format email invalide." });
    }

    const result = await _execFacturer({
      nomClient, emailClient, nomPharmacien,
      typeMvt: type_mvt, motif, medicaments,
    });

    return res.status(201).json({
      success: true,
      factureGeneree: true,
      message: result.email.statut === "envoye"
        ? `Facture générée et envoyée à ${emailClient}.`
        : "Facture générée avec succès.",
      ...result,
    });

  } catch (error) {
    console.error("[FactureController] Erreur :", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/factures/facturer-mouvement
// Déclenché automatiquement après enregistrement d'un mouvement (type sortie)
// Body: { id_mvt, nomClient, emailClient, nomPharmacien, type_mvt, motif,
//         medicaments: [{ nom, quantite, prixUnitaire }] }
// ─────────────────────────────────────────────────────────────────────────────
async function facturerDepuisMouvement(req, res) {
  try {
    const {
      id_mvt, nomClient, emailClient, nomPharmacien,
      type_mvt, motif, medicaments,
    } = req.body;

    // Seule une SORTIE est facturable
    if (!estFacturable(type_mvt)) {
      return res.status(200).json({
        success: true,
        factureGeneree: false,
        message: `Mouvement #${id_mvt} de type '${type_mvt}' : pas de facture client.`,
      });
    }

    if (!nomClient || !nomPharmacien || !Array.isArray(medicaments) || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Données insuffisantes pour générer la facture.",
      });
    }

    if (emailClient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClient)) {
      return res.status(400).json({ success: false, message: "Format email invalide." });
    }

    const result = await _execFacturer({
      nomClient, emailClient, nomPharmacien,
      typeMvt: type_mvt, motif, medicaments,
    });

    console.log(`[FactureController] Facture auto générée pour mouvement #${id_mvt} — ${result.numeroFacture}`);

    return res.status(201).json({
      success: true,
      factureGeneree: true,
      id_mvt,
      message: result.email.statut === "envoye"
        ? `Facture ${result.numeroFacture} générée et envoyée à ${emailClient}.`
        : `Facture ${result.numeroFacture} générée.`,
      ...result,
    });

  } catch (error) {
    console.error("[FactureController] Erreur facturerDepuisMouvement :", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/factures/telecharger/:fileName
// ─────────────────────────────────────────────────────────────────────────────
function telechargerFacture(req, res) {
  const { fileName } = req.params;
  if (fileName.includes("..") || fileName.includes("/")) {
    return res.status(400).json({ success: false, message: "Nom de fichier invalide." });
  }
  const filePath = path.join(__dirname, "../factures", fileName);
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("[FactureController] Téléchargement échoué :", err.message);
      return res.status(404).json({ success: false, message: "Fichier introuvable." });
    }
  });
}

module.exports = { facturer, facturerDepuisMouvement, telechargerFacture, estFacturable, _execFacturer };