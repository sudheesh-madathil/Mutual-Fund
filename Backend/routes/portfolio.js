const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { addHolding, listHoldings, deleteHolding ,getSummary} = require('../controllers/portfolioController');
router.get('/', verifyToken, listHoldings);
router.post('/add', verifyToken, addHolding);

router.get('/summary', verifyToken,getSummary);
router.delete('/:id', verifyToken, deleteHolding);

// historical endpoint below (see next section)
module.exports = router;
