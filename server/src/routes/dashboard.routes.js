const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, ctrl.getStats);
router.get('/commandes-par-jour', authenticate, ctrl.getCommandesParJour);

module.exports = router;