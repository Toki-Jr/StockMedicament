const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Créer un compte
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, email, password]
 *             properties:
 *               nom:      { type: string, example: Rakoto }
 *               prenom:   { type: string, example: Jean }
 *               email:    { type: string, example: jean@pharma.mg }
 *               password: { type: string, example: "Pass1234!" }
 *               role:     { type: string, example: user }
 *     responses:
 *       201: { description: Compte créé }
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Se connecter
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: jean@pharma.mg }
 *               password: { type: string, example: "Pass1234!" }
 *     responses:
 *       200: { description: Token JWT }
 */

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/users', authenticate, authorize('admin'), ctrl.getAllUsers);
router.put('/users/:id', authenticate, authorize('admin'), ctrl.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), ctrl.deleteUser);

module.exports = router;
