// controllers/portfolioController.js
const Portfolio = require('../models/Portfolio');
const FundLatestNav = require('../models/FundLatestNav');
const Fund = require('../models/Fund');
const { fetchFundLatest } = require('../services/mfapi');

function parseNavString(s) {
  if (!s) return null;
  return parseFloat(String(s).replace(/,/g, ''));
}

// ➕ Add holding
const addHolding = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { schemeCode, units, purchaseNav, investedAmount } = req.body;

    if (!schemeCode || !units || units <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    // Find fund details
    let fund = await Fund.findOne({ schemeCode }).lean();
    if (!fund) {
      try {
        const mf = await fetchFundLatest(schemeCode);
        if (mf && mf.meta) {
          await Fund.updateOne(
            { schemeCode },
            {
              $set: {
                schemeCode,
                schemeName: mf.meta.scheme_name || `Scheme ${schemeCode}`,
                lastUpdated: new Date()
              }
            },
            { upsert: true }
          );
          fund = await Fund.findOne({ schemeCode }).lean();
        }
      } catch (e) {
        // ignore API errors
      }
    }

    // Save portfolio with schemeName
    const doc = await Portfolio.create({
      userId,
      schemeCode,
      schemeName: fund ? fund.schemeName : `Scheme ${schemeCode}`,
      units,
      purchaseNav: purchaseNav ? parseFloat(purchaseNav) : undefined,
      investedAmount: investedAmount
        ? parseFloat(investedAmount)
        : purchaseNav
        ? units * parseFloat(purchaseNav)
        : undefined,
      purchaseDate: new Date()
    });

    res.json({
      success: true,
      message: 'Fund added to portfolio successfully',
      portfolio: {
        id: doc._id,
        schemeCode: doc.schemeCode,
        schemeName: doc.schemeName,
        units: doc.units,
        addedAt: doc.purchaseDate
      }
    });
  } catch (err) {
    console.error(err, "error");
    next(err);
  }
};

// 📋 List holdings
const listHoldings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const holdings = await Portfolio.find({ userId }).lean();

    if (!holdings.length) return res.json({ success: true, holdings: [] });

    const schemeCodes = holdings.map(h => h.schemeCode);
    const funds = await Fund.find({ schemeCode: { $in: schemeCodes } }).lean();
    const fundMap = new Map(funds.map(f => [f.schemeCode, f.schemeName]));

    const enhanced = holdings.map(h => ({
      id: h._id,
      schemeCode: h.schemeCode,
      schemeName: fundMap.get(h.schemeCode) || `Scheme ${h.schemeCode}`,
      units: h.units,
      addedAt: h.purchaseDate
    }));

    res.json({ success: true, holdings: enhanced });
  } catch (err) {
    next(err);
  }
};

// ❌ Delete holding
const deleteHolding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const removed = await Portfolio.findOneAndDelete({ _id: id, userId });
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Holding removed' });
  } catch (err) {
    next(err);
  }
};

// 📊 Portfolio summary
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
console.log(req.body,"user id");
    const holdings = await Portfolio.find({ userId }).lean();
    if (!holdings.length) {
      return res.json({
        success: true,
        summary: { invested: 0, current: 0, profitLoss: 0 }
      });
    }

    const schemeCodes = holdings.map(h => h.schemeCode);
    const navs = await FundLatestNav.find({ schemeCode: { $in: schemeCodes } }).lean();
    const navMap = new Map(navs.map(n => [n.schemeCode, parseNavString(n.nav)]));

    let invested = 0;
    let current = 0;

    holdings.forEach(h => {
      const latestNav = navMap.get(h.schemeCode) || h.purchaseNav || 0;
      const holdingInvested = h.investedAmount || (h.purchaseNav ? h.units * h.purchaseNav : 0);
      const holdingCurrent = h.units * latestNav;

      invested += holdingInvested;
      current += holdingCurrent;
    });

    const profitLoss = current - invested;

    res.json({
      success: true,
      summary: {
        invested: invested.toFixed(2),
        current: current.toFixed(2),
        profitLoss: profitLoss.toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addHolding,
  listHoldings,
  deleteHolding,
  getSummary
};
