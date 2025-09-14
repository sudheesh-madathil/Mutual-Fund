const Portfolio = require('../models/Portfolio');
const FundLatestNav = require('../models/FundLatestNav');
const Fund = require('../models/Fund');
const { fetchFundLatest } = require('../services/mfapi');

function parseNavString(s) {
  if (!s) return null;
  return parseFloat(String(s).replace(/,/g, ''));
}

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
      schemeName: fund ? fund.schemeName : `Scheme ${schemeCode}`, // ✅ store name
      units,
      purchaseNav: purchaseNav ? parseFloat(purchaseNav) : undefined,
      investedAmount: investedAmount
        ? parseFloat(investedAmount)
        : purchaseNav
        ? units * parseFloat(purchaseNav)
        : undefined,
      purchaseDate: new Date()
    });

    // Send response
    res.json({
      success: true,
      message: 'Fund added to portfolio successfully',
      portfolio: {
        id: doc._id,
        schemeCode: doc.schemeCode,
        schemeName: doc.schemeName,  // ✅ now included
        units: doc.units,
        addedAt: doc.purchaseDate
      }
    });
  } catch (err) {
console.log(err,"error");
  }
};

const listHoldings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const holdings = await Portfolio.find({ userId }).lean();

    if (!holdings.length) return res.json({ success: true, holdings: [] });

    // fetch all fund names in bulk
    const schemeCodes = holdings.map(h => h.schemeCode);
    const funds = await Fund.find({ schemeCode: { $in: schemeCodes } }).lean();
    const fundMap = new Map(funds.map(f => [f.schemeCode, f.schemeName]));

    // attach schemeName
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

const deleteHolding = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const removed = await Portfolio.findOneAndDelete({ _id: id, userId });
    if (!removed) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Holding removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addHolding,
  listHoldings,
  deleteHolding
};
