const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
  schemeCode: { type: Number, unique: true, required: true, index: true },
  schemeName: String,
  isinGrowth: String,
  isinDivReinvestment: String,
  fundHouse: String,
  schemeType: String,
  schemeCategory: String,
  lastUpdated: Date
});

module.exports = mongoose.model('Fund', FundSchema);
