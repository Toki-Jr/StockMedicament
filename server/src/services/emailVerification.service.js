/**
 * services/emailVerification.service.js
 *
 * Vérifie si un email Google existe via Firebase Identity Toolkit.
 * Utilise le même pattern que auth.service.js (Prisma + log).
 *
 * SETUP :
 *   1. Créez un projet sur https://console.firebase.google.com
 *   2. Authentication > Sign-in method > Activer "E-mail/Mot de passe"
 *   3. Paramètres du projet > Général > Web API Key
 *   4. Ajoutez dans votre .env : FIREBASE_API_KEY=AIzaSy...
 */

const axios = require('axios');
const dns   = require('dns').promises;

const FIREBASE_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri';

const GOOGLE_DOMAINS = ['gmail.com', 'googlemail.com'];

// ─── Validation format email ─────────────────────────────────────────────────
function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Vérification DNS MX (domaine a-t-il un serveur mail ?) ─────────────────
async function domainHasMxRecords(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

// ─── Vérification via Firebase Identity Toolkit ──────────────────────────────
/**
 * Retourne { exists: bool, methods: string[] }
 * `methods` peut contenir : "password", "google.com", "emailLink", etc.
 *
 * @param {string} email
 * @returns {Promise<{ exists: boolean, methods: string[], isGoogleDomain: boolean }>}
 */
async function checkEmailExists(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email requis.');
  }

  const trimmed = email.trim().toLowerCase();

  if (!isValidEmailFormat(trimmed)) {
    throw new Error('Format d\'e-mail invalide.');
  }

  const domain        = trimmed.split('@')[1];
  const isGoogleDomain = GOOGLE_DOMAINS.includes(domain);

  // ── Étape 1 : vérifier que le domaine a des MX records ──────────────────
  const hasMx = await domainHasMxRecords(domain);
  if (!hasMx) {
    return { exists: false, methods: [], isGoogleDomain, reason: 'domain_no_mx' };
  }

  // ── Étape 2 : appel Firebase Identity Toolkit ────────────────────────────
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    // Pas de clé configurée → on retourne un résultat partiel avec avertissement
    // (le domaine existe au moins)
    return {
      exists: null,
      methods: [],
      isGoogleDomain,
      reason: 'no_firebase_key',
      warning: 'FIREBASE_API_KEY manquante dans .env — vérification complète impossible.',
    };
  }

  try {
    const response = await axios.post(
      `${FIREBASE_URL}?key=${apiKey}`,
      {
        identifier:   trimmed,
        continueUri:  process.env.APP_URL || 'http://localhost:3000',
      },
      { timeout: 8000 }
    );

    const { registered, signinMethods = [] } = response.data;

    return {
      exists:        registered === true,
      methods:       signinMethods,
      isGoogleDomain,
    };

  } catch (err) {
    const code = err.response?.data?.error?.message;

    // Codes d'erreur Firebase connus
    if (code === 'INVALID_EMAIL') {
      return { exists: false, methods: [], isGoogleDomain, reason: 'invalid_email' };
    }
    if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      throw new Error('Trop de tentatives. Réessayez dans quelques minutes.');
    }

    throw new Error(`Erreur Firebase : ${code || err.message}`);
  }
}

module.exports = { checkEmailExists };