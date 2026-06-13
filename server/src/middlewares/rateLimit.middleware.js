/**
 * middlewares/rateLimit.middleware.js
 *
 * Rate limiting spécifique à la vérification d'email.
 * Évite le scraping / brute-force de comptes Google.
 *
 * Si vous avez déjà un fichier rateLimit dans vos middlewares,
 * ajoutez simplement l'export emailCheckLimiter dedans.
 */

const rateLimit = require('express-rate-limit');

const emailCheckLimiter = rateLimit({
  windowMs:        60 * 1000,      // fenêtre de 1 minute
  max:             10,             // max 10 vérifications / minute / IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Trop de tentatives. Réessayez dans une minute.',
  },
});

module.exports = { emailCheckLimiter };