const express = require("express");
const router  = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');

const {
  facturer,
  facturerDepuisMouvement,
  telechargerFacture,
} = require("../controllers/facture.controller");

// POST /api/factures/facturer
//   → Appel manuel depuis le bouton "Facturer" du front
//   → Génère PDF + envoie email si type_mvt === 'sortie'
router.post("/facturer",authenticate, facturer);

// POST /api/factures/facturer-mouvement
//   → Appelé automatiquement après création d'un mouvementstock
//   → Déclenche la facture uniquement si type_mvt === 'sortie'
router.post("/facturer-mouvement", authenticate, facturerDepuisMouvement);

// GET /api/factures/telecharger/:fileName
//   → Téléchargement du PDF
router.get("/telecharger/:fileName", telechargerFacture);

module.exports = router;