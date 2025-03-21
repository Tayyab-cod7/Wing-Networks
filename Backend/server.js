const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const rechargeRoutes = require('./src/routes/rechargeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const withdrawalRoutes = require('./src/routes/withdrawalRoutes');

// Load env vars
dotenv.config();

const app = express();

// Production security middleware
if (process.env.NODE_ENV === 'production') {
  // Enable compression
  app.use(compression());
  
  // Security headers
  app.use(helmet());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5000', 'http://69.62.119.91:5000', 'http://69.62.119.91'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  
  // Add detailed logging for login endpoint
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    console.log('Login request body:', JSON.stringify(req.body));
  }
  
  // Capture original send method
  const originalSend = res.send;
  res.send = function(body) {
    if (req.path === '/api/auth/login') {
      console.log('Login response:', body);
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// API health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// API Routes - must come before static files
app.use('/api/auth', authRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/earnings', require('./src/routes/earningRoutes'));
app.use('/api/contact', contactRoutes);
app.use('/api/withdrawal', withdrawalRoutes);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const receiptsDir = path.join(uploadsDir, 'receipts');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Static files - serve from Front end directory
app.use(express.static(path.join(__dirname, '..', 'Front end', 'public')));

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Front end', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Add more detailed error logging
  if (req.path === '/api/auth/login') {
    console.error('Login error details:', {
      message: err.message,
      name: err.name,
      code: err.code
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
});