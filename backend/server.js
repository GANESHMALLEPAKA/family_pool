import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const app = express();

// Middleware - CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));
// Stripe webhook needs raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }), paymentWebhook);

app.use(express.json());

// Routes
import authRoutes from './routes/auth.js';
import familyRoutes from './routes/families.js';
import goalRoutes from './routes/goals.js';
import reportRoutes from './routes/reports.js';
import aiWorkingRoutes from './routes/ai-working.js';
import paymentRoutes from './routes/payment.js';
import paymentWebhook from './routes/webhook.js';

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiWorkingRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    groq_configured: !!process.env.GROQ_API_KEY
  });
});

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/family-pool')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Status: http://localhost:${PORT}/api/ai/status`);
});