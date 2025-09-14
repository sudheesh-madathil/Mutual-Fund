const express = require('express');
const router = express.Router();
const { syncMasterList, searchFunds, getFundDetails } = require('../controllers/fundController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

// admin-only endpoint to seed/sync all funds from mfapi
router.post('/sync', verifyToken, requireAdmin, syncMasterList);
router.get('/search', searchFunds);
router.get('/:schemeCode', getFundDetails);

module.exports = router;
