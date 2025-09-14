const express = require('express');
const router = express.Router();
const {
  syncLatestNav,
  syncFundHistory,
  getLatestNav,
  getNavHistory,
} = require('../controllers/navController');

// GET /api/nav/sync/latest/:schemeCode → sync latest NAV
router.get('/sync/latest/:schemeCode', syncLatestNav);

// GET /api/nav/sync/history/:schemeCode → sync full history
router.get('/sync/history/:schemeCode', syncFundHistory);

// GET /api/nav/latest/:schemeCode → get latest NAV
router.get('/latest/:schemeCode', getLatestNav);

// GET /api/nav/history/:schemeCode → get history
router.get('/history/:schemeCode', getNavHistory);

module.exports = router;
