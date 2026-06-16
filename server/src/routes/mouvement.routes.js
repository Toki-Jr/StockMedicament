const router = require('express').Router();
const ctrl = require('../controllers/mouvement.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Mouvements de stock
 *   description: Entrées et sorties de médicaments
 */

/**
 * @swagger
 * /mouvements/stats:
 *   get:
 *     tags: [Mouvements de stock]
 *     summary: Statistiques globales (total entrées / sorties)
 *     responses:
 *       200: { description: Statistiques des mouvements }
 */
router.get('/stats', authenticate, ctrl.getStats);

/**
 * @swagger
 * /mouvements:
 *   get:
 *     tags: [Mouvements de stock]
 *     summary: Lister les mouvements (filtrable)
 *     parameters:
 *       - in: query
 *         name: type_mvt
 *         schema: { type: string, enum: [entree, sortie] }
 *       - in: query
 *         name: id_lot
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des mouvements }
 *   post:
 *     tags: [Mouvements de stock]
 *     summary: Enregistrer une entrée ou sortie de stock
 *     description: Met automatiquement à jour la quantité du lot et vérifie les alertes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type_mvt, quantite_mvt, motif, id_lot]
 *             properties:
 *               type_mvt:     { type: string, enum: [entree, sortie], example: "sortie" }
 *               quantite_mvt: { type: integer, example: 10 }
 *               motif:        { type: string,  example: "Dispensation patient" }
 *               id_lot:       { type: integer, example: 1 }
 *               date_mvt:     { type: string,  format: date-time }
 *     responses:
 *       201: { description: Mouvement créé, lot mis à jour, alertes vérifiées }
 *       400: { description: Stock insuffisant ou données invalides }
 */
router.get('/',       authenticate, ctrl.getAll);
router.post('/',      authenticate, ctrl.create);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteMvt);

/**
 * @swagger
 * /mouvements/{id}:
 *   get:
 *     tags: [Mouvements de stock]
 *     summary: Détail d'un mouvement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Mouvement trouvé }
 */
router.get('/:id', authenticate, ctrl.getById);

module.exports = router;