const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const {
  listLogisticsPartners,
  approveLogisticsPartner,
  rejectLogisticsPartner
} = require('../controllers/logisticsPartnerController');

router.get('/', authenticate, requireAdmin, listLogisticsPartners);
router.patch('/:id/approve', authenticate, requireAdmin, approveLogisticsPartner);
router.patch('/:id/reject', authenticate, requireAdmin, rejectLogisticsPartner);

module.exports = router;
