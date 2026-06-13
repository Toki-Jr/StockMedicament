/**
 * controllers/emailVerification.controller.js
 *
 * Suit le même pattern que auth.controller.js :
 *   - import service
 *   - import utils/response
 *   - try/catch avec badRequest / serverError
 */

const emailVerificationService = require('../services/emailVerification.service');
const { success, badRequest, error } = require('../utils/response');

/**
 * POST /api/auth/check-email
 * Body : { email: string }
 *
 * Réponse succès :
 * {
 *   exists: true | false | null,
 *   methods: ["password", "google.com", ...],
 *   isGoogleDomain: bool,
 *   reason?: string,   // présent si exists === false
 *   warning?: string   // présent si FIREBASE_API_KEY manquante
 * }
 */
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequest(res, 'Le champ email est requis.');
    }

    const result = await emailVerificationService.checkEmailExists(email);
    return success(res, result);

  } catch (err) {
    // Erreurs de validation → 400
    if (
      err.message.includes('invalide') ||
      err.message.includes('requis')   ||
      err.message.includes('Trop de tentatives')
    ) {
      return badRequest(res, err.message);
    }

    console.error('🔴 checkEmail error:', err);
    return error(res, err.message || 'Erreur serveur interne');
  }
};

module.exports = { checkEmail };