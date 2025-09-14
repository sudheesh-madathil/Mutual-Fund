const FundLatestNav = require('../models/FundLatestNav');
const FundNavHistory = require('../models/FundNavHistory');
const { fetchFundLatest, fetchFundHistory } = require('../services/mfapi');

// 🔹 Sync latest NAV for one fund
const syncLatestNav = async (req, res, next) => {
  try {
    const schemeCode = Number(req.params.schemeCode);
    const data = await fetchFundLatest(schemeCode); // { data: [{ nav, date }] }

    if (!data?.data?.[0]) {
      return res.status(404).json({ success: false, message: 'No NAV found' });
    }

    const { nav, date } = data.data[0];

    // Update FundLatestNav
    await FundLatestNav.updateOne(
      { schemeCode },
      { $set: { schemeCode, nav: Number(nav), date, updatedAt: new Date() } },
      { upsert: true }
    );

    // Insert into history (unique index avoids duplicates)
    await FundNavHistory.updateOne(
      { schemeCode, date },
      { $set: { schemeCode, nav: Number(nav), date } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Latest NAV synced', schemeCode, nav, date });
  } catch (err) {
    next(err);
  }
};

// 🔹 Sync full history for one fund
const syncFundHistory = async (req, res, next) => {
  try {
    const schemeCode = Number(req.params.schemeCode);
    const data = await fetchFundHistory(schemeCode); // { data: [{ nav, date }, ...] }

    if (!data?.data?.length) {
      return res.status(404).json({ success: false, message: 'No history found' });
    }

    const ops = data.data.map((item) => ({
      updateOne: {
        filter: { schemeCode, date: item.date },
        update: { $set: { schemeCode, nav: Number(item.nav), date: item.date } },
        upsert: true,
      },
    }));

    await FundNavHistory.bulkWrite(ops);

    res.json({ success: true, message: 'History synced', schemeCode, count: ops.length });
  } catch (err) {
    next(err);
  }
};

// 🔹 Get latest NAV
const getLatestNav = async (req, res, next) => {
  try {
    const schemeCode = Number(req.params.schemeCode);
    const nav = await FundLatestNav.findOne({ schemeCode });

    if (!nav) return res.status(404).json({ success: false, message: 'NAV not found' });

    res.json({ success: true, nav });
  } catch (err) {
    next(err);
  }
};

// 🔹 Get NAV history
const getNavHistory = async (req, res, next) => {
  try {
    const schemeCode = Number(req.params.schemeCode);
    const history = await FundNavHistory.find({ schemeCode }).sort({ date: -1 }).limit(100);

    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  syncLatestNav,
  syncFundHistory,
  getLatestNav,
  getNavHistory,
};
