const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  schemeCode: { type: Number, required: true, index: true },
   schemeName: { type: String },
  units: { type: Number, required: true },
  // optional: store purchase info (useful for P&L)
  purchaseNav: { type: Number }, // optional
  investedAmount: { type: Number }, // optional
  purchaseDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
