const router = require('express').Router();
const ctrl = require('../controllers/lot.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Lots
 */
/**
 * @swagger
 * /lots:
 *   get:
 *     tags: [Lots]
 *     summary: Lister les lots
 *     parameters:
 *       - in: query
 *         name: id_medoc
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste }
 *   post:
 *     tags: [Lots]
 *     summary: Créer un lot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [numero_lot, date_fabrication, date_expiration, quantite_entre, id_medoc]
 *             properties:
 *               numero_lot:       { type: string,  example: "LOT-2024-001" }
 *               date_fabrication: { type: string,  format: date, example: "2024-01-15" }
 *               date_expiration:  { type: string,  format: date, example: "2026-01-15" }
 *               quantite_entre:   { type: integer, example: 500 }
 *               quantite_sortie:  { type: integer, example: 0 }
 *               id_medoc:         { type: integer, example: 1 }
 *     responses:
 *       201: { description: Créé }
 */
router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, authorize('admin', 'pharmacien'), ctrl.create);
router.get('/expiration', authenticate, ctrl.lotsExpirantBientot);

/**
 * @swagger
 * /lots/{id}:
 *   get:
 *     tags: [Lots]
 *     summary: Détail lot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Trouvé }
 *   put:
 *     tags: [Lots]
 *     summary: Modifier lot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: Mis à jour }
 *   delete:
 *     tags: [Lots]
 *     summary: Supprimer lot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supprimé }
 */
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id', authenticate, authorize('admin', 'pharmacien'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
