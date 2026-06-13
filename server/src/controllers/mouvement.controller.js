const svc = require('../services/mouvement.service');
const { success, created, badRequest } = require('../utils/response');
const { estFacturable, _execFacturer } = require('./facture.controller');

const getAll = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query, req.user);
    return success(res, data, `${data.length} mouvement(s)`);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await svc.getById(req.params.id);
    return success(res, data);
  } catch (err) { next(err); }
};

/**
 * POST /api/mouvements
 *
 * Champs habituels : type_mvt, quantite_mvt, motif, id_lot
 * Champs facture   : nomClient, emailClient, nomPharmacien
 *   → obligatoires uniquement si type_mvt === 'sortie'
 *
 * Comportement :
 *   - Enregistre toujours le mouvement (entree ou sortie)
 *   - Si type_mvt === 'sortie' : génère la facture PDF + envoie email auto
 *   - Si type_mvt === 'entree' : mouvement seul, pas de facture
 */
const create = async (req, res, next) => {
  try {
    const {
      type_mvt, quantite_mvt, motif, id_lot,
      // Données client pour la facture (sortie uniquement)
      nomClient, emailClient, nomPharmacien,
    } = req.body;

    // ── Validation mouvement ────────────────────────────────────────────
    if (!type_mvt || !quantite_mvt || !motif || !id_lot)
      return badRequest(res, 'Champs requis : type_mvt (entree|sortie), quantite_mvt, motif, id_lot');

    if (!['entree', 'sortie'].includes(type_mvt))
      return badRequest(res, "type_mvt doit être 'entree' ou 'sortie'");

    // ── Validation données client pour une sortie ───────────────────────
    if (estFacturable(type_mvt)) {
      if (emailClient && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClient)) {
        return badRequest(res, "Format email client invalide.");
      }
    }

    // ── 1. Créer le mouvement (service existant inchangé) ───────────────
    const mouvement = await svc.create({ ...req.body, id_user: req.user.id });

    // ── 2. Si SORTIE → générer facture + envoyer email auto ─────────────
    let factureInfo = null;

    if (estFacturable(type_mvt)) {
      try {
        // Construire la liste médicaments depuis le lot du mouvement
        const mvtComplet = await svc.getById(mouvement.id_mvt);
        const med = mvtComplet.lot?.medicament;

        const medicaments = [{
          nom:          med?.nom          || motif,
          quantite:     quantite_mvt,
          prixUnitaire: med?.prix_unitaire || 0,
        }];

        factureInfo = await _execFacturer({
          nomClient,
          emailClient:   emailClient || "",
          nomPharmacien,
          typeMvt:       type_mvt,
          motif,
          medicaments,
        });

        console.log(
          `[MouvementController] Facture auto : ${factureInfo.numeroFacture}` +
          ` — email: ${factureInfo.email.statut}`
        );
      } catch (factureErr) {
        // La facture a échoué mais le mouvement est déjà enregistré → on log et on continue
        console.error("[MouvementController] Erreur facturation auto :", factureErr.message);
        factureInfo = { erreur: factureErr.message };
      }
    }

    // ── 3. Réponse ──────────────────────────────────────────────────────
    return created(res, {
      mouvement,
      facture: estFacturable(type_mvt)
        ? {
            generee:      !factureInfo?.erreur,
            numeroFacture: factureInfo?.numeroFacture || null,
            totalGeneral:  factureInfo?.totalGeneral  || null,
            downloadUrl:   factureInfo?.downloadUrl   || null,
            email:         factureInfo?.email         || null,
            erreur:        factureInfo?.erreur        || null,
          }
        : {
            generee:  false,
            message:  "Entrée de stock : aucune facture client générée.",
          },
    }, type_mvt === 'sortie'
        ? `Mouvement de sortie enregistré — Facture ${factureInfo?.numeroFacture || 'non générée'}`
        : `Mouvement d'entrée enregistré`
    );

  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await svc.getStats();
    return success(res, data, 'Statistiques des mouvements');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, getStats };