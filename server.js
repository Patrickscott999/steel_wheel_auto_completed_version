// Import packages
const express = require('express');
const cors = require('cors');

// Import configuration and routes
const config = require('./config/config');
const invoiceRoutes = require('./routes/invoices');

// Express setup for API routes
const app = express();

// Enable CORS for frontend integration
app.use(cors(config.server.cors));

app.use(express.json());

// API Routes
app.use('/api/invoices', invoiceRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint '${req.originalUrl}' was not found`
  });
});

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.server.env} mode`);
});

module.exports = app;
