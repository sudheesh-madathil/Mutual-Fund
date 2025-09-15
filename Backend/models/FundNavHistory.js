const mongoose = require('mongoose');

const FundNavHistorySchema = new mongoose.Schema({
  schemeCode: { type: Number, required: true, index: true },
  nav: { type: Number, required: true },
  date: { type: String, required: true }, // dd-mm-yyyy
  createdAt: { type: Date, default: Date.now }
});

FundNavHistorySchema.index({ schemeCode: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('FundNavHistory', FundNavHistorySchema);
