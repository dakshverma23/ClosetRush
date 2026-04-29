const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const {
  listWarehouseManagers,
  approveWarehouseManager,
  rejectWarehouseManager
} = require('../controllers/warehouseManagerController');

router.get('/', authenticate, requireAdmin, listWarehouseManagers);
router.patch('/:id/approve', authenticate, requireAdmin, approveWarehouseManager);
router.patch('/:id/reject', authenticate, requireAdmin, rejectWarehouseManager);

module.exports = router;
