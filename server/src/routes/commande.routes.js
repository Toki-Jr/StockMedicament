const router = require('express').Router();
const ctrl = require('../controllers/commande.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Commandes
 */
/**
 * @swagger
 * /commandes:
 *   get:
 *     tags: [Commandes]
 *     summary: Lister les commandes
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [en_attente, validee, annulee, livree] }
 *     responses:
 *       200: { description: Liste }
 *   post:
 *     tags: [Commandes]
 *     summary: Créer une commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantite, id_medoc]
 *             properties:
 *               quantite: { type: integer, example: 200 }
 *               id_medoc: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Créée }
 * /commandes/{id}:
 *   get:
 *     tags: [Commandes]
 *     summary: Détail commande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Trouvée }
 *   delete:
 *     tags: [Commandes]
 *     summary: Supprimer commande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supprimée }
 * /commandes/{id}/statut:
 *   patch:
 *     tags: [Commandes]
 *     summary: Changer le statut
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statut]
 *             properties:
 *               statut: { type: string, enum: [en_attente, validee, annulee, livree] }
 *     responses:
 *       200: { description: Mis à jour }
 */
router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, ctrl.create);
router.get('/:id', authenticate, ctrl.getById);
router.patch('/:id/statut', authenticate, authorize('admin', 'pharmacien'), ctrl.updateStatut);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
