const mongoose = require('mongoose');

const FundLatestNavSchema = new mongoose.Schema({
  schemeCode: { type: Number, required: true, unique: true, index: true },
  nav: { type: Number, required: true },
  date: { type: String, required: true }, // dd-mm-yyyy per spec
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FundLatestNav', FundLatestNavSchema);
