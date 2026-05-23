const router = require('express').Router();
const ctrl   = require('../controllers/historique.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/',          authenticate, authorize('admin'), ctrl.getAll);
router.delete('/all',    authenticate, authorize('admin'), ctrl.removeAll);
router.delete('/:id',    authenticate, authorize('admin'), ctrl.remove);

module.exports = router;