const router = require('express').Router();
const ctrl = require('../controllers/medicament.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Médicaments
 *   description: Gestion du catalogue de médicaments
 */

/**
 * @swagger
 * /medicaments:
 *   get:
 *     tags: [Médicaments]
 *     summary: Lister tous les médicaments (avec recherche)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Recherche par nom ou code CIP
 *     responses:
 *       200: { description: Liste des médicaments avec stock actuel }
 *   post:
 *     tags: [Médicaments]
 *     summary: Ajouter un médicament (admin/pharmacien)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code_cip, nom, forme, dosage, prix_unitaire, seuil_alerte_qte, seuil_alerte_peremption]
 *             properties:
 *               code_cip:                { type: string,  example: "3400935514688" }
 *               nom:                     { type: string,  example: "Paracétamol 500mg" }
 *               forme:                   { type: string,  example: "comprimé" }
 *               dosage:                  { type: number,  example: 500 }
 *               prix_unitaire:           { type: integer, example: 250 }
 *               seuil_alerte_qte:        { type: integer, example: 50 }
 *               seuil_alerte_peremption: { type: integer, example: 30 }
 *     responses:
 *       201: { description: Médicament créé }
 */
router.post('/refresh-alertes', ctrl.refreshAlertes);
router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, authorize('admin', 'pharmacien'), ctrl.create);

/**
 * @swagger
 * /medicaments/{id}:
 *   get:
 *     tags: [Médicaments]
 *     summary: Détail d'un médicament (avec stock et alertes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Médicament trouvé }
 *       404: { description: Introuvable }
 *   put:
 *     tags: [Médicaments]
 *     summary: Modifier un médicament
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Mis à jour }
 *   delete:
 *     tags: [Médicaments]
 *     summary: Supprimer un médicament (admin)
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