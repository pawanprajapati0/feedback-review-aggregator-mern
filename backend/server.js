const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '20kb' }));

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required.'], trim: true, maxlength: 80 },
    product: { type: String, required: [true, 'Product or service is required.'], trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: ['Product', 'Service', 'App', 'Other'], default: 'Product' },
    rating: { type: Number, required: true, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'Rating must be a whole number from 1 to 5.' } },
    message: { type: String, required: [true, 'Review message is required.'], trim: true, minlength: 2, maxlength: 1200 },
    recommend: { type: Boolean, default: true },
    helpful: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

function databaseReady(res) {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    message: 'MongoDB database is not connected. Check MONGO_URI, database username/password, and Atlas IP Access List.',
    database: 'disconnected',
  });
  return false;
}

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function cleanFeedbackInput(body = {}) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    product: typeof body.product === 'string' ? body.product.trim() : '',
    category: typeof body.category === 'string' ? body.category : 'Product',
    rating: Number(body.rating),
    message: typeof body.message === 'string' ? body.message.trim() : '',
    recommend: body.recommend !== false,
  };
}

app.get('/', (_req, res) => {
  res.json({
    name: 'Feedback & Review Aggregator Platform API',
    message: 'Backend server is running.',
    health: '/api/health',
    feedback: '/api/feedback',
  });
});

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    server: 'running',
    database: connected ? 'connected' : 'disconnected',
    message: connected ? 'API and MongoDB are ready.' : 'API is running, but MongoDB is not connected yet.',
  });
});

// GET all feedback. Search/filter/sort can also be done in the frontend.
app.get('/api/feedback', async (_req, res, next) => {
  if (!databaseReady(res)) return;
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json({ count: feedback.length, feedback });
  } catch (error) { next(error); }
});

// CREATE a review.
app.post('/api/feedback', async (req, res, next) => {
  if (!databaseReady(res)) return;
  try {
    const input = cleanFeedbackInput(req.body);
    if (!input.name || !input.product || !input.message) {
      return res.status(400).json({ message: 'Name, product/service, and review message are required.' });
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }
    const feedback = await Feedback.create(input);
    return res.status(201).json({ message: 'Review created successfully.', feedback });
  } catch (error) { next(error); }
});

// UPDATE a review.
app.patch('/api/feedback/:id', async (req, res, next) => {
  if (!databaseReady(res)) return;
  if (!validObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' });
  try {
    const input = cleanFeedbackInput(req.body);
    if (!input.name || !input.product || !input.message) {
      return res.status(400).json({ message: 'Name, product/service, and review message are required.' });
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, input, {
      new: true,
      runValidators: true,
    });
    if (!feedback) return res.status(404).json({ message: 'Review not found.' });
    return res.json({ message: 'Review updated successfully.', feedback });
  } catch (error) { next(error); }
});

// DELETE a review.
app.delete('/api/feedback/:id', async (req, res, next) => {
  if (!databaseReady(res)) return;
  if (!validObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' });
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Review not found.' });
    return res.json({ message: 'Review deleted successfully.', id: req.params.id });
  } catch (error) { next(error); }
});

// Increase a review's helpful count.
app.patch('/api/feedback/:id/helpful', async (req, res, next) => {
  if (!databaseReady(res)) return;
  if (!validObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' });
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true, runValidators: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Review not found.' });
    return res.json({ message: 'Thanks for the feedback.', feedback });
  } catch (error) { next(error); }
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((error, _req, res, _next) => {
  console.error('API error:', error.message);
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Start the HTTP server first so /api/health explains database connection issues clearly.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('DB_USERNAME') || uri.includes('YOUR_CLUSTER')) {
    console.error('MongoDB URI is missing or still has example placeholders. Update backend/.env.');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Check your Atlas Database Access username/password, correct cluster URI, URL-encoded special characters, and IP Access List.');
  }
}

connectDatabase();
