const cron = require('node-cron');
const { fetchFundLatest } = require('./mfapi');
const Fund = require('../models/Fund');
const Portfolio = require('../models/Portfolio');
const FundLatestNav = require('../models/FundLatestNav');
const FundNavHistory = require('../models/FundNavHistory');
const formatDate = require('../utils/formatDate');

function chunkArray(arr, size) {
  const out = [];
  for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
  return out;
}

async function updateNavForScheme(schemeCode) {
  try {
    const data = await fetchFundLatest(schemeCode);
    if (!data || !data.data) return;
    const navValue = parseFloat(String(data.data.nav).replace(/,/g, ''));
    const date = data.data.date; // expected dd-mm-yyyy
    if (!navValue || !date) return;

    await FundLatestNav.updateOne({ schemeCode }, { $set: { nav: navValue, date, updatedAt: new Date() } }, { upsert: true });
    // insert history if not exists
    await FundNavHistory.updateOne({ schemeCode, date }, { $setOnInsert: { schemeCode, date, nav: navValue } }, { upsert: true });
    console.log(`Updated NAV ${schemeCode} => ${navValue} (${date})`);
  } catch (err) {
    console.error('updateNavForScheme error', schemeCode, err.message);
  }
}

async function runUpdateBatch(schemeCodes = []) {
  // batch size to avoid API throttling
  const chunks = chunkArray(schemeCodes, 30);
  for (const c of chunks) {
    await Promise.all(c.map(sc => updateNavForScheme(sc)));
    // small delay between chunks
    await new Promise(r => setTimeout(r, 1000));
  }
}

function scheduleDailyNavUpdate() {
  if (process.env.CRON_ENABLED !== 'true') {
    console.log('CRON disabled by env setting');
    return;
  }

  // Run daily at 22:10 IST
  cron.schedule('0 10 22 * * *', async () => {
    try {
      console.log('NAV updater started (22:10 IST)');
      // 1) preferred: update NAVs for funds that are present in Portfolio (only what users hold)
      const schemesInPortfolio = await Portfolio.distinct('schemeCode');
      let schemeCodes = schemesInPortfolio.length ? schemesInPortfolio : [];

      // if none (fresh DB), fallback to updating master list top N (or all)
      if (!schemeCodes.length) {
        const all = await Fund.find({}).limit(200).select('schemeCode').lean();
        schemeCodes = all.map(f => f.schemeCode);
      }

      await runUpdateBatch(schemeCodes);
      console.log('NAV updater finished');
    } catch (err) {
      console.error('NAV updater failed', err);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
}

module.exports = { scheduleDailyNavUpdate, runUpdateBatch };
