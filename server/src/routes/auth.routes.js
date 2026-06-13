const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const changePassword = require('../controllers/changePassword.controller');
const updatePreferences = require('../controllers/updatePreferences.controller');

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

router.post('/register',    ctrl.register);
router.post('/login',       ctrl.login);
router.post('/send-otp',    ctrl.sendOtp);
router.post('/verify-otp',  ctrl.verifyOtp);
router.post('/forgot-password',  ctrl.forgotPassword);
router.post('/reset-password',   ctrl.resetPassword);
router.get('/me',           authenticate,                     ctrl.getMe);
router.put('/me',           authenticate,                     ctrl.updateMe);
router.get('/users',        authenticate, authorize('admin'), ctrl.getAllUsers);
router.put('/users/:id',    authenticate, authorize('admin'), ctrl.updateUser);
router.delete('/me',        authenticate,                     ctrl.deleteMe);
router.delete('/users/:id', authenticate, authorize('admin'), ctrl.deleteUser);
router.patch('/users/:id/approuver',    authenticate, authorize('admin'), ctrl.approuverUser);
router.put('/change-password/:id',    authenticate, changePassword.changePasswordController);
router.patch('/preferences',            authenticate, updatePreferences.updatePreferencesController);

module.exports = router;
