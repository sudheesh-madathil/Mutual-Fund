require('dotenv').config(); // ✅ Load env first

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes & middleware
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const fundRoutes = require('./routes/funds');
// const errorHandler = require('./middlewares/errorHandler');

// DB + cron job
const connectDB = require('./config/db');
const { scheduleDailyNavUpdate } = require('./services/navUpdater');

const app = express();

// Security + utils middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Basic rate limiting (100 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/funds', fundRoutes);
// app.use('/api/admin', adminRoutes); // optional

// Error handler (always last)
// app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();

    // Schedule cron jobs
    scheduleDailyNavUpdate();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();

module.exports = app; // ✅ Export app (for testing if needed)
