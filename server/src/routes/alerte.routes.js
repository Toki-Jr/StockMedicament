const router = require('express').Router();
const ctrl = require('../controllers/alerte.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Alertes
 *   description: Alertes automatiques (stock faible / péremption)
 */

/**
 * @swagger
 * /alertes/non-lues:
 *   get:
 *     tags: [Alertes]
 *     summary: Nombre d'alertes non lues (badge notification)
 *     responses:
 *       200: { description: Compteur alertes non lues }
 */
router.get('/non-lues', authenticate, ctrl.getNonLues);

/**
 * @swagger
 * /alertes/marquer-toutes-lues:
 *   patch:
 *     tags: [Alertes]
 *     summary: Marquer toutes les alertes comme lues
 *     responses:
 *       200: { description: Toutes lues }
 */
router.patch('/marquer-toutes-lues', authenticate, ctrl.marquerToutesLues);

/**
 * @swagger
 * /alertes:
 *   get:
 *     tags: [Alertes]
 *     summary: Lister les alertes
 *     parameters:
 *       - in: query
 *         name: type_alerte
 *         schema: { type: string, enum: [stock_faible, peremption] }
 *       - in: query
 *         name: lu
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Liste des alertes }
 */
router.get('/', authenticate, ctrl.getAll);

/**
 * @swagger
 * /alertes/{id}:
 *   get:
 *     tags: [Alertes]
 *     summary: Détail d'une alerte
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Alerte trouvée }
 *   patch:
 *     tags: [Alertes]
 *     summary: Marquer une alerte comme lue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Alerte mise à jour }
 *   delete:
 *     tags: [Alertes]
 *     summary: Supprimer une alerte (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supprimée }
 */
router.get('/:id', authenticate, ctrl.getById);
router.patch('/:id/lire', authenticate, ctrl.marquerLu);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;