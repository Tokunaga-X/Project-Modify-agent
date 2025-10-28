const express = require('express');
const cors = require('cors');
const codeRoutes = require('./routes/codeRoutes');
const repoRoutes = require('./routes/repoRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/code', codeRoutes);
app.use('/api/repo', repoRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is running' });
});

module.exports = app;
