/**
 * routes/emailVerification.routes.js
 *
 * Route publique (pas de authenticate) car c'est une vérification
 * préalable à la connexion — comme /auth/login et /auth/register.
 *
 * À monter dans app.js :
 *   const emailVerifRoutes = require('./routes/emailVerification.routes');
 *   app.use('/api/auth', emailVerifRoutes);
 */

const router     = require('express').Router();
const ctrl       = require('../controllers/emailVerification.controller');
const { emailCheckLimiter } = require('../middlewares/rateLimit.middleware');

/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     tags: [Auth]
 *     summary: Vérifier si un email Google existe
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:        { type: boolean }
 *                 methods:       { type: array, items: { type: string } }
 *                 isGoogleDomain:{ type: boolean }
 *                 reason:        { type: string }
 *       400:
 *         description: Email invalide ou manquant
 */
router.post('/check-email', emailCheckLimiter, ctrl.checkEmail);

module.exports = router;