const Fund = require('../models/Fund');
const { fetchFundList } = require('../services/mfapi');

const syncMasterList = async (req, res, next) => {
  try {
    const list = await fetchFundList(); // array from API
    
    const ops = list.map(f => ({
      updateOne: {
        filter: { schemeCode: Number(f.schemeCode) },
        update: {
          $set: {
            schemeCode: Number(f.schemeCode),
            schemeName: f.schemeName,
            isinGrowth: f.isinGrowth,
            isinDivReinvestment: f.isinDivReinvestment,
            fundHouse: f.fundHouse || f.schemeName,
            schemeType: f.schemeType,
            schemeCategory: f.schemeCategory,
            lastUpdated: new Date()
          }
        },
        upsert: true
      }
    }));

    await Fund.bulkWrite(ops);

    res.json({
      success: true,
      message: 'Fund master list synced',
      count: list.length
    });
  } catch (err) {
    next(err);
  }
};


const searchFunds = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const regex = new RegExp(q, 'i');
    const results = await Fund.find({ $or: [{ schemeName: regex }, { fundHouse: regex }] }).limit(50);
    res.json({ success:true, results });
  } catch (err) {
    next(err);
  }
};

const getFundDetails = async (req, res, next) => {
  try {
    const schemeCode = Number(req.params.schemeCode);
    const fund = await Fund.findOne({ schemeCode });
    if (!fund) return res.status(404).json({ success:false, message:'Fund not found in master data' });
    // optionally include latest nav
    res.json({ success:true, fund });
  } catch (err) { next(err); }
};
module.exports ={getFundDetails,searchFunds,syncMasterList};